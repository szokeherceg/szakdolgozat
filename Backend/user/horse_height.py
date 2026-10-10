from pathlib import Path

from django.conf import settings

import cv2
import numpy as np
import torch
from ultralytics import YOLO


AI_MODEL_DIR = Path("/mnt/c/Users/admin/Documents/SULI/szakdolgozat/Backend/ai_model")
HORSE_POSE_PATH = Path("/mnt/c/Users/admin/Documents/SULI/szakdolgozat/Backend/ai_model/train_files/runs/pose/horse_pose_006_finetune_video_v1-2/weights/best.pt")
HOOF_POSE_PATH = Path("/mnt/c/Users/admin/Documents/SULI/szakdolgozat/Backend/ai_model/train_files/runs/pose/hoof_pose/hoof_pose_001/weights/best.pt")
SEG_MODEL_PATH = "yolo26m-seg.pt"


DEVICE = "cuda:0" if torch.cuda.is_available() else "cpu"


HORSE_CONF = 0.50
HORSE_IOU = 0.85
HORSE_IMGSZ = 1280

HOOF_CONF = 0.15
HOOF_IOU = 0.50
HOOF_IMGSZ = 1280
HOOF_KP_CONF = 0.75

SEG_CONF = 0.25

WITHERS_IDX = 18
HORSE_CATEGORY = 17

LEFT_FRONT_INDEX = 13
RIGHT_FRONT_INDEX = 14

HOOF_ASSOCIATION_MAX_DISTANCE_RATIO = 0.30

ARUCO_SIZE_CM = 20.0
ARUCO_MARKER_ID = 0
ARUCO_DICTIONARY = cv2.aruco.DICT_4X4_50
ARUCO_MIN_PERIMETER = 40

WITHERS_MAX_DISTANCE = 100


horse_pose_006 = YOLO(str(HORSE_POSE_PATH))
hoof_pose_001 = YOLO(str(HOOF_POSE_PATH))
seg_model = YOLO(SEG_MODEL_PATH)


def get_horse_mask(image):
    result = seg_model.predict(
        source=image,
        conf=SEG_CONF,
        device=DEVICE,
        verbose=False,
    )[0]

    if result.masks is None or result.boxes is None:
        return None

    classes = result.boxes.cls.cpu().numpy().astype(int)
    confidences = result.boxes.conf.cpu().numpy()

    horse_indices = np.where(
        classes == HORSE_CATEGORY
    )[0]

    if len(horse_indices) == 0:
        return None

    best = horse_indices[
        np.argmax(
            confidences[horse_indices]
        )
    ]

    mask = (
        result.masks.data[best]
        .cpu()
        .numpy()
        > 0.5
    ).astype(np.uint8)

    height, width = image.shape[:2]

    if mask.shape != (height, width):
        mask = cv2.resize(
            mask,
            (width, height),
            interpolation=cv2.INTER_NEAREST,
        )

    return mask


def project_point_to_mask(
    x,
    y,
    mask,
):
    if mask is None:
        return float(x), float(y)

    height, width = mask.shape

    x_int = int(round(x))
    y_int = int(round(y))

    if (
        0 <= x_int < width
        and 0 <= y_int < height
        and mask[y_int, x_int]
    ):
        return float(x), float(y)

    ys, xs = np.where(mask)

    if len(xs) == 0:
        return float(x), float(y)

    distances_sq = (
        (xs.astype(np.float32) - float(x)) ** 2
        + (ys.astype(np.float32) - float(y)) ** 2
    )

    index = int(
        np.argmin(distances_sq)
    )

    distance = float(
        np.sqrt(
            distances_sq[index]
        )
    )

    if distance > WITHERS_MAX_DISTANCE:
        return float(x), float(y)

    return (
        float(xs[index]),
        float(ys[index]),
    )


def get_horse_points(
    image,
    horse_mask,
):
    result = horse_pose_006.predict(
        source=image,
        imgsz=HORSE_IMGSZ,
        conf=HORSE_CONF,
        iou=HORSE_IOU,
        device=DEVICE,
        verbose=False,
    )[0]

    if result.keypoints is None:
        return None

    if len(result.keypoints) == 0:
        return None

    points = (
        result.keypoints.xy
        .cpu()
        .numpy()
    )

    if result.keypoints.conf is None:
        confidences = None
    else:
        confidences = (
            result.keypoints.conf
            .cpu()
            .numpy()
        )

    points = points[0]

    if confidences is None:
        confidence_points = None
    else:
        confidence_points = confidences[0]

    if WITHERS_IDX >= len(points):
        return None

    withers_x, withers_y = points[
        WITHERS_IDX
    ]

    if (
        withers_x <= 0
        or withers_y <= 0
    ):
        return None

    if confidence_points is None:
        withers_conf = 1.0
    else:
        withers_conf = float(
            confidence_points[
                WITHERS_IDX
            ]
        )

    withers_x, withers_y = (
        project_point_to_mask(
            withers_x,
            withers_y,
            horse_mask,
        )
    )

    front_hooves = []

    for index in (
        LEFT_FRONT_INDEX,
        RIGHT_FRONT_INDEX,
    ):
        if index >= len(points):
            continue

        x, y = points[index]

        if x <= 0 or y <= 0:
            continue

        if confidence_points is None:
            confidence = 1.0
        else:
            confidence = float(
                confidence_points[index]
            )

        front_hooves.append(
            {
                "x": float(x),
                "y": float(y),
                "conf": confidence,
                "index": index,
            }
        )

    return {
        "withers": {
            "x": float(withers_x),
            "y": float(withers_y),
            "conf": withers_conf,
        },
        "front_hooves": front_hooves,
    }


def choose_front_hoof_point(
    front_hooves,
):
    if not front_hooves:
        return None

    return max(
        front_hooves,
        key=lambda hoof: (
            hoof["y"],
            hoof["conf"],
        ),
    )


def get_hoof_predictions(image):
    result = hoof_pose_001.predict(
        source=image,
        imgsz=HOOF_IMGSZ,
        conf=HOOF_CONF,
        iou=HOOF_IOU,
        device=DEVICE,
        verbose=False,
    )[0]

    if result.boxes is None:
        return []

    if result.keypoints is None:
        return []

    if result.keypoints.conf is None:
        keypoint_confidences = None
    else:
        keypoint_confidences = (
            result.keypoints.conf
            .cpu()
            .numpy()
        )

    hooves = []

    for i in range(
        len(result.boxes)
    ):
        points = (
            result.keypoints.xy[i]
            .cpu()
            .numpy()
        )

        if len(points) == 0:
            continue

        x = float(points[0][0])
        y = float(points[0][1])

        if keypoint_confidences is None:
            kp_conf = 1.0
        else:
            kp_conf = float(
                keypoint_confidences[i][0]
            )

        if kp_conf < HOOF_KP_CONF:
            continue

        box = (
            result.boxes.xyxy[i]
            .cpu()
            .numpy()
        )

        x1 = int(
            round(box[0])
        )
        y1 = int(
            round(box[1])
        )
        x2 = int(
            round(box[2])
        )
        y2 = int(
            round(box[3])
        )

        if (
            x2 <= x1
            or y2 <= y1
        ):
            continue

        hooves.append(
            {
                "x": x,
                "y": y,
                "x1": x1,
                "y1": y1,
                "x2": x2,
                "y2": y2,
                "conf": float(
                    result.boxes.conf[i].item()
                ),
                "kp_conf": kp_conf,
            }
        )

    return hooves


def is_point_inside_mask(
    mask,
    x,
    y,
    radius=6,
):
    if mask is None:
        return False

    height, width = mask.shape

    x = int(round(x))
    y = int(round(y))

    if (
        x < 0
        or y < 0
        or x >= width
        or y >= height
    ):
        return False

    x1 = max(
        0,
        x - radius,
    )
    y1 = max(
        0,
        y - radius,
    )
    x2 = min(
        width,
        x + radius + 1,
    )
    y2 = min(
        height,
        y + radius + 1,
    )

    region = mask[
        y1:y2,
        x1:x2,
    ]

    if region.size == 0:
        return False

    return (
        np.mean(region > 0)
        >= 0.20
    )


def filter_hooves(
    hooves,
    horse_mask,
):
    return [
        hoof
        for hoof in hooves
        if is_point_inside_mask(
            horse_mask,
            hoof["x"],
            hoof["y"],
        )
    ]


def find_hoof_bottom(
    image,
    hoof,
    horse_mask,
):
    height, width = image.shape[:2]

    x1 = hoof["x1"]
    y1 = hoof["y1"]
    x2 = hoof["x2"]
    y2 = hoof["y2"]

    box_width = max(
        1,
        x2 - x1,
    )

    box_height = max(
        1,
        y2 - y1,
    )

    pad_x = int(
        round(
            box_width * 0.15
        )
    )

    pad_y = int(
        round(
            box_height * 0.10
        )
    )

    roi_x1 = max(
        0,
        x1 - pad_x,
    )

    roi_x2 = min(
        width - 1,
        x2 + pad_x,
    )

    roi_y1 = max(
        0,
        y1 - pad_y,
    )

    roi_y2 = min(
        height - 1,
        y2 + pad_y,
    )

    search_start_y = max(
        int(round(hoof["y"])),
        y1
        + int(
            round(
                box_height * 0.15
            )
        ),
    )

    search_start_y = min(
        search_start_y,
        roi_y2,
    )

    if horse_mask is not None:
        roi_mask = horse_mask[
            search_start_y : roi_y2 + 1,
            roi_x1 : roi_x2 + 1,
        ]

        if roi_mask.size > 0:
            rows = []

            for local_y in range(
                roi_mask.shape[0]
            ):
                row = roi_mask[
                    local_y
                ]

                if (
                    np.mean(row > 0)
                    >= 0.10
                ):
                    rows.append(
                        local_y
                    )

            if rows:
                bottom_y = (
                    search_start_y
                    + max(rows)
                )

                maximum_y = min(
                    height - 1,
                    y2
                    + int(
                        round(
                            box_height * 0.15
                        )
                    ),
                )

                return min(
                    bottom_y,
                    maximum_y,
                )

    return min(
        height - 1,
        y2,
    )


def choose_hoof(
    hooves,
    front_hoof_point,
    image,
):
    if (
        not hooves
        or front_hoof_point is None
    ):
        return None

    max_distance = (
        image.shape[1]
        * HOOF_ASSOCIATION_MAX_DISTANCE_RATIO
    )

    best_hoof = None
    best_distance = None

    for hoof in hooves:
        distance = np.sqrt(
            (
                hoof["x"]
                - front_hoof_point["x"]
            ) ** 2
            + (
                hoof["y"]
                - front_hoof_point["y"]
            ) ** 2
        )

        if distance > max_distance:
            continue

        if (
            best_distance is None
            or distance < best_distance
        ):
            best_distance = distance
            best_hoof = hoof

    return best_hoof


def detect_aruco(image):
    dictionary = (
        cv2.aruco.getPredefinedDictionary(
            ARUCO_DICTIONARY
        )
    )

    parameters = (
        cv2.aruco.DetectorParameters()
    )

    detector = cv2.aruco.ArucoDetector(
        dictionary,
        parameters,
    )

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY,
    )

    corners, ids, _ = (
        detector.detectMarkers(
            gray
        )
    )

    if ids is None:
        return None

    for (
        marker_corners,
        marker_id,
    ) in zip(
        corners,
        ids.flatten(),
    ):
        if (
            int(marker_id)
            != ARUCO_MARKER_ID
        ):
            continue

        points = (
            marker_corners
            .reshape(4, 2)
            .astype(np.float32)
        )

        perimeter = cv2.arcLength(
            points.reshape(
                -1,
                1,
                2,
            ),
            True,
        )

        if (
            perimeter
            < ARUCO_MIN_PERIMETER
        ):
            continue

        sides = []

        for i in range(4):
            p1 = points[i]
            p2 = points[
                (i + 1) % 4
            ]

            sides.append(
                float(
                    np.linalg.norm(
                        p2 - p1
                    )
                )
            )

        pixel_size = float(
            np.mean(sides)
        )

        return (
            ARUCO_SIZE_CM
            / pixel_size
        )

    return None


def measure_horse(
    image_path,
):
    image = cv2.imread(
        str(image_path)
    )

    if image is None:
        return None

    horse_mask = get_horse_mask(
        image
    )

    cm_per_pixel = detect_aruco(
        image
    )

    if cm_per_pixel is None:
        return None

    horse_points = get_horse_points(
        image,
        horse_mask,
    )

    if horse_points is None:
        return None

    withers = horse_points[
        "withers"
    ]

    front_hoof_point = (
        choose_front_hoof_point(
            horse_points[
                "front_hooves"
            ]
        )
    )

    if front_hoof_point is None:
        return None

    hooves = get_hoof_predictions(
        image
    )

    hooves = filter_hooves(
        hooves,
        horse_mask,
    )

    hoof = choose_hoof(
        hooves,
        front_hoof_point,
        image,
    )

    if hoof is None:
        return None

    hoof_bottom_y = find_hoof_bottom(
        image,
        hoof,
        horse_mask,
    )

    height_px = (hoof_bottom_y - withers["y"])

    if height_px <= 0:
        return None

    height = (height_px * cm_per_pixel)
    height = round(float(height), 1)

    result_dir = (Path(settings.MEDIA_ROOT) / "ai_results")
    result_dir.mkdir(parents=True, exist_ok=True)
    result_path = (result_dir / f"horse_{Path(image_path).stem}_measurement.jpg")
    annotated = image.copy()

    withers_x = int(round(withers["x"]))
    withers_y = int(round(withers["y"]))
    hoof_x = int(round(hoof["x"]))
    hoof_y = int(round(hoof_bottom_y))

    cv2.circle(annotated, (withers_x, withers_y), 8, (0, 255, 0), -1)
    cv2.circle(annotated, (hoof_x, hoof_y), 8, (0, 0, 255), -1)
    cv2.line(annotated, (withers_x, withers_y), (withers_x, hoof_y), (0, 255, 0), 4)

    text = f"{height:.1f} cm"
    text_x = max(10, min(withers_x + 15, annotated.shape[1] - 180))
    text_y = max(40, (withers_y + hoof_y) // 2)

    cv2.putText(annotated, text, (text_x, text_y), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 255, 0), 3, cv2.LINE_AA)
    cv2.imwrite(str(result_path), annotated)

    return height, result_path