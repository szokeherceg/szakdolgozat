from pathlib import Path
import json
import random
import shutil

import cv2
import numpy as np
import pandas as pd
import yaml
from tqdm import tqdm
from ultralytics import YOLO

DATASET_DIR = Path(
    "/mnt/c/Users/admin/.cache/kagglehub/datasets/"
    "bloodaxe/animal-pose-dataset/versions/1"
)

QUALITY_FILE = Path(
    "/mnt/c/Users/admin/Documents/SULI/szakdolgozat/"
    "Backend/ai_model/dataset_gen/dataset_statistics/"
    "keypoint_quality_metrics.csv"
)

OUTPUT_DIR = Path(
    "/mnt/c/Users/admin/Documents/SULI/szakdolgozat/"
    "Backend/ai_model/horse_yolo_pose_dataset_final_v2_modified"
)

SEGMENTATION_MODEL = Path(
    "/mnt/c/Users/admin/Documents/SULI/szakdolgozat/" "Backend/ai_model/yolo26x-seg.pt"
)

DEBUG_DIR = OUTPUT_DIR / "debug_visualizations"

MIN_SCORE = 7
VALID_QUALITY = ["excellent", "good", "fair"]

BBOX_PADDING = 0.08
MASK_KERNEL_SIZE = 11
MASK_ITERATIONS = 1
VISIBILITY_RADIUS = 15

TRAIN_RATIO = 0.85

HORSE_CATEGORY_ID = 4

FLIP_IDX = [1, 0, 2, 4, 3, 6, 5, 8, 7, 10, 9, 12, 11, 14, 13, 16, 15, 17, 18, 19]
TRASH_LIST = {
    "2007_000063.jpg", "2007_000175.jpg", "2007_000464.jpg", "2007_000491.jpg",
    "2007_000504.jpg", "2007_000528.jpg", "2007_000549.jpg", "2007_000676.jpg",
    "2007_000720.jpg", "2007_000799.jpg", "2007_000876.jpg", "2007_000904.jpg",
    "2007_000925.jpg", "2007_001073.jpg", "2007_001185.jpg", "2007_001225.jpg",
    "2007_001239.jpg", "2007_001299.jpg", "2007_001340.jpg", "2007_001397.jpg",
    "2007_001416.jpg", "2007_001586.jpg", "2007_001594.jpg", "2007_001724.jpg",
    "2007_001955.jpg", "2007_002057.jpg", "2007_002273.jpg", "2007_002343.jpg",
    "2007_002361.jpg", "2007_002444.jpg", "2007_002465.jpg", "2007_002517.jpg",
    "2007_002534.jpg", "2007_002621.jpg", "2007_002719.jpg", "2007_002761.jpg",
    "2007_002811.jpg", "2007_002830.jpg", "2007_003056.jpg", "2007_003310.jpg",
    "2007_003444.jpg", "2007_003510.jpg", "2007_003714.jpg", "2007_003848.jpg",
    "2007_003988.jpg", "2007_004118.jpg", "2007_004186.jpg", "2007_004419.jpg",
    "2007_004455.jpg", "2007_004514.jpg", "2007_004537.jpg", "2007_004722.jpg",
    "2007_004787.jpg", "2007_005073.jpg", "2007_005114.jpg", "2007_005118.jpg",
    "2007_005193.jpg", "2007_005315.jpg", "2007_005370.jpg", "2007_005391.jpg",
    "2007_005527.jpg", "2007_005537.jpg", "2007_005609.jpg", "2007_005634.jpg",
    "2007_005663.jpg", "2007_005708.jpg", "2007_005820.jpg", "2007_006037.jpg",
    "2007_006134.jpg", "2007_006159.jpg", "2007_006364.jpg", "2007_006431.jpg",
    "2007_006451.jpg", "2007_006465.jpg", "2007_006579.jpg", "2007_006830.jpg",
    "2007_006866.jpg", "2007_007071.jpg", "2007_007137.jpg", "2007_007204.jpg",
    "2007_007353.jpg", "2007_007504.jpg", "2007_007567.jpg", "2007_007584.jpg",
    "2007_007629.jpg", "2007_007639.jpg", "2007_007727.jpg", "2007_007748.jpg",
    "2007_007798.jpg", "2007_007874.jpg", "2007_007902.jpg", "2007_008256.jpg",
    "2007_008316.jpg", "2007_008375.jpg", "2007_008431.jpg", "2007_008433.jpg",
    "2007_008526.jpg", "2007_008625.jpg", "2007_008630.jpg", "2007_008711.jpg",
    "2007_008775.jpg", "2007_008796.jpg", "2007_008986.jpg", "2007_009139.jpg",
    "2007_009147.jpg", "2007_009180.jpg", "2007_009182.jpg", "2007_009405.jpg",
    "2007_009475.jpg", "2007_009486.jpg", "2007_009587.jpg", "2007_009623.jpg",
    "2007_009761.jpg", "2007_009968.jpg",
    "2008_000119.jpg", "2008_000213.jpg", "2008_000219.jpg", "2008_000371.jpg",
    "2008_000431.jpg", "2008_000492.jpg", "2008_000570.jpg", "2008_000602.jpg",
    "2008_001235.jpg", "2008_001278.jpg", "2008_001382.jpg", "2008_001542.jpg",
    "2008_001934.jpg", "2008_002172.jpg", "2008_002411.jpg", "2008_002459.jpg",
    "2008_002589.jpg", "2008_002686.jpg", "2008_002860.jpg", "2008_003018.jpg",
    "2008_003272.jpg", "2008_003283.jpg", "2008_003316.jpg", "2008_003379.jpg",
    "2008_003380.jpg", "2008_003677.jpg", "2008_004166.jpg", "2008_004430.jpg",
    "2008_004624.jpg", "2008_005313.jpg", "2008_005431.jpg", "2008_005642.jpg",
    "2008_005668.jpg", "2008_005726.jpg", "2008_005928.jpg", "2008_006028.jpg",
    "2008_006096.jpg", "2008_006219.jpg", "2008_006235.jpg", "2008_006397.jpg",
    "2008_006909.jpg", "2008_006912.jpg", "2008_007004.jpg", "2008_007444.jpg",
    "2008_007531.jpg", "2008_007998.jpg", "2008_008011.jpg", "2008_008012.jpg",
    "2008_008040.jpg", "2008_008147.jpg", "2008_008193.jpg", "2008_008279.jpg",
    "2008_008296.jpg", "2008_008421.jpg", "2008_003782.jpg", "2008_002338.jpg",
    "2008_005792.jpg", "2008_005934.jpg", "2008_006087.jpg", "2008_008500.jpg",
    "2009_000017.jpg", "2009_000169.jpg", "2009_000293.jpg", "2009_000409.jpg",
    "2009_000412.jpg", "2009_000603.jpg", "2009_000793.jpg", "2009_000843.jpg",
    "2009_001539.jpg", "2009_001635.jpg", "2009_001636.jpg", "2009_001664.jpg",
    "2009_001749.jpg", "2009_001990.jpg", "2009_002182.jpg", "2009_002231.jpg",
    "2009_002420.jpg", "2009_002750.jpg", "2009_003445.jpg", "2009_003572.jpg",
    "2009_003637.jpg", "2009_003686.jpg", "2009_004105.jpg", "2009_004118.jpg",
    "2009_004134.jpg", "2009_004606.jpg", "2009_004662.jpg", "2009_004815.jpg",
    "2009_003127.jpg", "2009_000931.jpg", "2009_001036.jpg", "2009_001500.jpg",
    "2009_002697.jpg", "2009_002957.jpg", "2009_003294.jpg",
    "2010_001595.jpg", "2010_001676.jpg", "2010_002948.jpg", "2010_003532.jpg",
    "2010_003573.jpg", "2010_003714.jpg", "2010_003890.jpg", "2010_004228.jpg",
    "2010_004477.jpg", "2010_004542.jpg", "2010_004913.jpg", "2010_005270.jpg",
    "2010_005784.jpg", "2010_000613.jpg", "2010_000749.jpg", "2010_000923.jpg",
    "2010_001077.jpg", "2010_002482.jpg", "2010_002615.jpg", "2010_003192.jpg",
    "2010_005595.jpg", "2010_005733.jpg", "2010_005976.jpg",
    "2011_000022.jpg", "2011_000538.jpg", "2011_000840.jpg", "2011_000893.jpg",
    "2011_000982.jpg", "2011_001251.jpg", "2011_001956.jpg", "2011_002047.jpg",
    "2011_002362.jpg", "2011_002999.jpg", "2011_002697.jpg",
    "ho196.jpeg", "ho49.jpeg",
}

def parse_keypoints(values):
    return [
        [
            float(point[0]),
            float(point[1]),
            int(point[2]),
        ]
        for point in values
    ]


def bbox_iou(first_bbox, second_bbox):
    first_left, first_top, first_width, first_height = map(float, first_bbox)
    second_left, second_top, second_width, second_height = map(float, second_bbox)

    first_right = first_left + first_width
    first_bottom = first_top + first_height
    second_right = second_left + second_width
    second_bottom = second_top + second_height

    left = max(first_left, second_left)
    top = max(first_top, second_top)
    right = min(first_right, second_right)
    bottom = min(first_bottom, second_bottom)

    overlap_width = max(0.0, right - left)
    overlap_height = max(0.0, bottom - top)
    intersection = overlap_width * overlap_height

    union = first_width * first_height + second_width * second_height - intersection

    return intersection / union if union > 0 else 0.0


def refine_sample(
    image,
    horse_bbox,
    keypoints,
    segmentation_boxes,
    segmentation_masks,
):
    image_height, image_width = image.shape[:2]

    visible_keypoints = [point for point in keypoints if point[2] > 0]

    best_box = None
    best_mask = None
    best_score = -1.0

    for index in range(len(segmentation_boxes)):
        current_box = segmentation_boxes[index]

        current_mask = cv2.resize(
            segmentation_masks[index].astype(np.uint8),
            (image_width, image_height),
            interpolation=cv2.INTER_NEAREST,
        )

        if visible_keypoints:
            hits = 0

            for point in visible_keypoints:
                x = int(round(point[0]))
                y = int(round(point[1]))

                if (
                    0 <= x < image_width
                    and 0 <= y < image_height
                    and current_mask[y, x] > 0
                ):
                    hits += 1

            keypoint_inside_ratio = hits / len(visible_keypoints)
        else:
            keypoint_inside_ratio = 0.0

        mask_hit_ratio = keypoint_inside_ratio

        score = (
            bbox_iou(horse_bbox, current_box)
            + 0.01 * keypoint_inside_ratio
            + 0.01 * mask_hit_ratio
        )

        if score > best_score:
            best_score = score
            best_box = current_box
            best_mask = current_mask

    if best_mask is not None:
        kernel = cv2.getStructuringElement(
            cv2.MORPH_ELLIPSE,
            (MASK_KERNEL_SIZE, MASK_KERNEL_SIZE),
        )

        best_mask = cv2.dilate(
            best_mask,
            kernel,
            iterations=MASK_ITERATIONS,
        )

    refined_keypoints = []

    for point in keypoints:
        x, y, visibility = point

        if visibility == 0 or best_mask is None:
            refined_keypoints.append(
                [
                    x,
                    y,
                    visibility,
                ]
            )
            continue

        image_x = int(round(x))
        image_y = int(round(y))

        if not (0 <= image_x < image_width and 0 <= image_y < image_height):
            refined_keypoints.append(
                [
                    x,
                    y,
                    0,
                ]
            )
            continue

        y_start = max(
            0,
            image_y - VISIBILITY_RADIUS,
        )
        y_end = min(
            image_height,
            image_y + VISIBILITY_RADIUS + 1,
        )

        x_start = max(
            0,
            image_x - VISIBILITY_RADIUS,
        )
        x_end = min(
            image_width,
            image_x + VISIBILITY_RADIUS + 1,
        )

        local_mask = best_mask[
            y_start:y_end,
            x_start:x_end,
        ]

        coverage = np.sum(local_mask > 0) / (local_mask.size + 1e-6)

        if best_mask[image_y, image_x] > 0 and coverage > 0.15:
            new_visibility = 2
        elif coverage > 0.01:
            new_visibility = 1
        else:
            new_visibility = visibility

        refined_keypoints.append(
            [
                x,
                y,
                int(new_visibility),
            ]
        )

    if best_box is not None:
        left, top, width, height = best_box
    else:
        left, top, width, height = horse_bbox

    right = left + width
    bottom = top + height

    for point in refined_keypoints:
        x, y, visibility = point

        if visibility <= 0:
            continue

        if not (0 <= x < image_width and 0 <= y < image_height):
            continue

        left = min(left, x)
        top = min(top, y)
        right = max(right, x)
        bottom = max(bottom, y)

    width = max(1.0, right - left)
    height = max(1.0, bottom - top)

    padding_width = width * BBOX_PADDING
    padding_height = height * BBOX_PADDING

    left = max(0.0, left - padding_width)
    top = max(0.0, top - padding_height)
    right = min(
        float(image_width),
        right + padding_width,
    )
    bottom = min(
        float(image_height),
        bottom + padding_height,
    )

    final_bbox = [
        left,
        top,
        max(1.0, right - left),
        max(1.0, bottom - top),
    ]

    return refined_keypoints, final_bbox


def valid_geometry(
    keypoints,
    bbox,
    image_width,
    image_height,
):
    first_left, first_top, first_width, first_height = bbox

    visible_points = []

    for point in keypoints:
        x, y, visibility = point

        if visibility <= 0:
            continue

        if not (0 <= x < image_width and 0 <= y < image_height):
            continue

        if (
            first_left - first_width * 0.35 <= x <= first_left + first_width * 1.35
            and first_top - first_height * 0.35 <= y <= first_top + first_height * 1.35
        ):
            visible_points.append(point)

    if len(visible_points) < 3:
        return False

    xs = [point[0] for point in visible_points]
    ys = [point[1] for point in visible_points]

    if max(xs) - min(xs) > first_width * 2.5:
        return False

    if max(ys) - min(ys) > first_height * 2.5:
        return False

    return True


random.seed(42)
np.random.seed(42)

shutil.rmtree(
    OUTPUT_DIR,
    ignore_errors=True,
)

(OUTPUT_DIR / "images" / "train").mkdir(
    parents=True,
    exist_ok=True,
)

(OUTPUT_DIR / "images" / "val").mkdir(
    parents=True,
    exist_ok=True,
)

(OUTPUT_DIR / "labels" / "train").mkdir(
    parents=True,
    exist_ok=True,
)

(OUTPUT_DIR / "labels" / "val").mkdir(
    parents=True,
    exist_ok=True,
)

DEBUG_DIR.mkdir(
    parents=True,
    exist_ok=True,
)

with open(
    DATASET_DIR / "keypoints.json",
    "r",
    encoding="utf-8",
) as file:
    data = json.load(file)


images = data["images"]
annotations = data["annotations"]

if isinstance(images, dict):
    images_info = {int(image_id): image_info for image_id, image_info in images.items()}
else:
    images_info = {int(image["id"]): image for image in images}


quality_data = pd.read_csv(QUALITY_FILE)

quality_data.columns = [str(column).strip().lower() for column in quality_data.columns]

if "annotation_id" in quality_data.columns:
    quality_data = quality_data.rename(columns={"annotation_id": "ann_id"})

quality_data = quality_data[
    quality_data["quality_tier"].astype(str).str.strip().str.lower().isin(VALID_QUALITY)
    & (quality_data["total_score"] >= MIN_SCORE)
]

valid_quality = {
    int(row["ann_id"]): (
        str(row["quality_tier"]),
        float(row["total_score"]),
    )
    for _, row in quality_data.iterrows()
}


segmentation_model = YOLO(str(SEGMENTATION_MODEL))

segmentation_cache = {}

samples = []

quality_annotation_count = 0

horse_annotation_index = 0


for annotation in tqdm(
    annotations,
    desc="Annotációk feldolgozása",
):
    if int(annotation["category_id"]) != HORSE_CATEGORY_ID:
        continue

    horse_annotation_index += 1

    annotation_id = int(
        annotation.get(
            "id",
            horse_annotation_index,
        )
    )

    if annotation_id not in valid_quality:
        continue

    quality_annotation_count += 1

    image_id = annotation["image_id"]

    image_info = images_info[image_id]

    if isinstance(image_info, dict):
        file_name = image_info["file_name"]
    else:
        file_name = image_info

    file_name = Path(file_name).name

    if file_name in TRASH_LIST:
        continue

    image_path = DATASET_DIR / "images" / "images" / file_name

    if not image_path.is_file():
        continue

    keypoints = parse_keypoints(annotation["keypoints"])

    bbox = annotation["bbox"]

    if bbox[2] <= 30 or bbox[3] <= 30:
        continue

    image_key = str(image_path)

    if image_key not in segmentation_cache:
        image = cv2.imread(str(image_path))

        result = segmentation_model(
            image,
            classes=[17],
            conf=0.25,
            verbose=False,
        )[0]

        if result.boxes is not None:
            segmentation_boxes = result.boxes.xywh.cpu().numpy()
        else:
            segmentation_boxes = np.empty(
                (0, 4),
                dtype=np.float32,
            )

        if result.masks is not None:
            segmentation_masks = result.masks.data.cpu().numpy()
        else:
            segmentation_masks = np.empty(
                (0,),
                dtype=np.uint8,
            )

        segmentation_cache[image_key] = (
            segmentation_boxes,
            segmentation_masks,
        )

    image = cv2.imread(str(image_path))

    segmentation_boxes, segmentation_masks = segmentation_cache[image_key]

    refined_keypoints, final_bbox = refine_sample(
        image,
        bbox,
        keypoints,
        segmentation_boxes,
        segmentation_masks,
    )

    image_height, image_width = image.shape[:2]

    if not valid_geometry(
        refined_keypoints,
        final_bbox,
        image_width,
        image_height,
    ):
        continue

    quality_tier, quality_score = valid_quality[annotation_id]

    samples.append(
        {
            "image_path": image_path,
            "image_id": image_id,
            "bbox": final_bbox,
            "keypoints": refined_keypoints,
            "quality_tier": quality_tier,
            "quality_score": quality_score,
        }
    )


image_to_samples = {}

for sample in samples:
    image_id = sample["image_id"]

    if image_id not in image_to_samples:
        image_to_samples[image_id] = []

    image_to_samples[image_id].append(sample)


image_ids = list(image_to_samples.keys())

random.shuffle(image_ids)

split_index = int(len(image_ids) * TRAIN_RATIO)

train_image_ids = set(image_ids[:split_index])

val_image_ids = set(image_ids[split_index:])

train_label_count = 0
val_label_count = 0


for image_id, image_samples in tqdm(
    image_to_samples.items(),
    desc="Dataset írása",
):
    if image_id in train_image_ids:
        split = "train"
    else:
        split = "val"

    image_path = image_samples[0]["image_path"]

    image = cv2.imread(str(image_path))

    if image is None:
        continue

    image_height, image_width = image.shape[:2]

    image_name = f"{image_id}_{image_path.name}"

    output_image = OUTPUT_DIR / "images" / split / image_name

    shutil.copy(
        str(image_path),
        str(output_image),
    )

    label_lines = []

    debug_image = image.copy()

    for sample in image_samples:
        bbox = sample["bbox"]

        bbox_x = bbox[0]
        bbox_y = bbox[1]
        bbox_width = bbox[2]
        bbox_height = bbox[3]

        center_x = (bbox_x + bbox_width / 2) / image_width

        center_y = (bbox_y + bbox_height / 2) / image_height

        normalized_width = bbox_width / image_width

        normalized_height = bbox_height / image_height

        label = [
            0,
            center_x,
            center_y,
            normalized_width,
            normalized_height,
        ]

        for point in sample["keypoints"]:
            x, y, visibility = point

            if visibility == 0:
                label.extend(
                    [
                        0.0,
                        0.0,
                        0.0,
                    ]
                )
            else:
                label.extend(
                    [
                        x / image_width,
                        y / image_height,
                        float(visibility),
                    ]
                )

        label_lines.append(" ".join(map(str, label)))

        if debug_image is not None:
            first_left = int(bbox_x)
            first_top = int(bbox_y)
            first_right = int(bbox_x + bbox_width)
            first_bottom = int(bbox_y + bbox_height)

            cv2.rectangle(
                debug_image,
                (first_left, first_top),
                (first_right, first_bottom),
                (0, 255, 0),
                2,
            )

            for point in sample["keypoints"]:
                x, y, visibility = point

                if visibility == 2:
                    circle_color = (
                        0,
                        255,
                        0,
                    )
                elif visibility == 1:
                    circle_color = (
                        0,
                        165,
                        255,
                    )
                else:
                    continue

                cv2.circle(
                    debug_image,
                    (int(x), int(y)),
                    4,
                    circle_color,
                    -1,
                )

    label_path = OUTPUT_DIR / "labels" / split / f"{Path(image_name).stem}.txt"

    with open(
        label_path,
        "w",
    ) as file:
        file.write("\n".join(label_lines))

    if split == "train":
        train_label_count += 1
    else:
        val_label_count += 1

    if debug_image is not None:
        debug_path = DEBUG_DIR / f"debug_{image_name}"

        cv2.imwrite(
            str(debug_path),
            debug_image,
        )

yaml_data = {
    "path": str(OUTPUT_DIR.resolve()),
    "train": "images/train",
    "val": "images/val",
    "nc": 1,
    "names": {0: "horse"},
    "kpt_shape": [20, 3],
    "flip_idx": FLIP_IDX,
}

with open(
    OUTPUT_DIR / "horse.yaml",
    "w",
) as file:
    yaml.dump(
        yaml_data,
        file,
        sort_keys=False,
    )


print(f"Quality annotációk: " f"{quality_annotation_count}")
print(f"Megmaradt annotációk: " f"{len(samples)}")
print(f"Train képek: " f"{len(train_image_ids)}")
print(f"Val képek: " f"{len(val_image_ids)}")
print(f"Train label: " f"{train_label_count}")
print(f"Val label: " f"{val_label_count}")
print(f"Dataset: " f"{OUTPUT_DIR}")
