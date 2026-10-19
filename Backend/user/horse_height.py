import logging
from pathlib import Path

import cv2
import numpy as np
import torch
from django.conf import settings
from ultralytics import YOLO

logger = logging.getLogger(__name__)


class HorseMeasurer:
    def __init__(self, horse_path, hoof_path, seg_path, device=None):
        self.device = device or ("cuda:0" if torch.cuda.is_available() else "cpu")
        self.horse_model = YOLO(horse_path)
        self.hoof_model = YOLO(hoof_path)
        self.seg_model = YOLO(seg_path)

        self.withers_idx = 14
        self.left_knee_idx = 9
        self.right_knee_idx = 10
        self.horse_class_id = 17

        self.aruco_size_cm = 20.0
        self.aruco_min_perimeter = 40
        self.aruco_max_distortion = 1.3

        self.seg_conf = 0.25
        self.horse_conf = 0.50
        self.horse_iou = 0.85
        self.hoof_conf = 0.15
        self.hoof_iou = 0.50
        self.hoof_kp_conf = 0.75

    def _get_horse_silhouette_mask(self, img):
        pred_res = self.seg_model.predict(
            img, conf=self.seg_conf, device=self.device, verbose=False
        )[0]
        if pred_res.masks is None or pred_res.boxes is None:
            return None

        classes = pred_res.boxes.cls.cpu().numpy().astype(int)
        horse_indices = np.where(classes == self.horse_class_id)[0]
        if len(horse_indices) == 0:
            return None

        best_horse_idx = horse_indices[
            np.argmax(pred_res.boxes.conf.cpu().numpy()[horse_indices])
        ]
        horse_mask = (pred_res.masks.data[best_horse_idx].cpu().numpy() > 0.5).astype(
            np.uint8
        )
        h, w = img.shape[:2]

        if horse_mask.shape != (h, w):
            return cv2.resize(horse_mask, (w, h), interpolation=cv2.INTER_NEAREST)
        return horse_mask

    def _get_horse_body_points(self, img):
        pred_res = self.horse_model.predict(
            img,
            imgsz=1280,
            conf=self.horse_conf,
            iou=self.horse_iou,
            device=self.device,
            verbose=False,
        )[0]
        if (
            pred_res.keypoints is None
            or pred_res.boxes is None
            or len(pred_res.boxes) == 0
        ):
            return None, None

        best_horse_idx = int(np.argmax(pred_res.boxes.conf.cpu().numpy()))
        pts = pred_res.keypoints.xy[best_horse_idx].cpu().numpy()

        required_max_idx = max(
            self.withers_idx,
            self.left_knee_idx,
            self.right_knee_idx,
        )
        if len(pts) <= required_max_idx:
            return None, None

        withers = pts[self.withers_idx]
        if withers[1] <= 0:
            return None, None

        knee_points = [
            pts[idx]
            for idx in (self.left_knee_idx, self.right_knee_idx)
            if pts[idx][1] > 0
        ]
        if not knee_points:
            return None, None

        knee = max(knee_points, key=lambda point: point[1])
        return withers, knee

    def _find_hoof_bottom_y(self, img, knee, horse_mask):
        pred_res = self.hoof_model.predict(
            img,
            imgsz=1280,
            conf=self.hoof_conf,
            iou=self.hoof_iou,
            device=self.device,
            verbose=False,
        )[0]
        if pred_res.boxes is None or pred_res.keypoints is None:
            return None

        h, w = img.shape[:2]
        max_dist = w * 0.30
        keypoint_conf = (
            pred_res.keypoints.conf.cpu().numpy()
            if pred_res.keypoints.conf is not None
            else None
        )

        best_hoof = None
        min_dist = float("inf")

        for hoof_idx, hoof_box in enumerate(pred_res.boxes.xyxy.cpu().numpy()):
            pts = pred_res.keypoints.xy[hoof_idx].cpu().numpy()
            if len(pts) == 0:
                continue

            if (
                keypoint_conf is not None
                and keypoint_conf[hoof_idx][0] < self.hoof_kp_conf
            ):
                continue

            hx, hy = pts[0]
            dist = np.hypot(hx - knee[0], hy - knee[1])

            if dist > max_dist or dist >= min_dist:
                continue

            px, py = int(round(hx)), int(round(hy))
            if horse_mask is not None:
                if not (0 <= px < w and 0 <= py < h):
                    continue
                roi = horse_mask[
                    max(0, py - 6) : min(h, py + 7), max(0, px - 6) : min(w, px + 7)
                ]
                if roi.size == 0 or np.mean(roi > 0) < 0.20:
                    continue

            min_dist = dist
            best_hoof = (hoof_box, (hx, hy))

        if not best_hoof:
            return None

        hoof_box, (hx, hy) = best_hoof
        x1, y1, x2, y2 = map(int, np.round(hoof_box))
        box_h = max(1, y2 - y1)

        if horse_mask is not None:
            search_y = max(int(round(hy)), y1 + int(box_h * 0.15))
            roi_x1 = max(0, x1 - int(box_h * 0.15))
            roi_x2 = min(w, x2 + int(box_h * 0.15) + 1)

            if search_y < y2 and roi_x1 < roi_x2:
                roi = horse_mask[search_y:y2, roi_x1:roi_x2]
                if roi.size > 0:
                    valid_rows = np.flatnonzero(np.mean(roi > 0, axis=1) >= 0.10)
                    if valid_rows.size > 0:
                        return int(
                            min(search_y + valid_rows[-1], y2 + int(box_h * 0.15))
                        )

        return int(min(h - 1, max(0, y2)))

    def _refine_withers_y(self, withers, horse_mask):
        if horse_mask is None:
            return withers[1]

        wx, wy = int(round(withers[0])), int(round(withers[1]))
        h, w = horse_mask.shape[:2]

        y_min, y_max = max(0, wy - 80), min(h, wy + 81)
        x_min, x_max = max(0, wx - 5), min(w, wx + 5)

        if y_min >= y_max or x_min >= x_max:
            return withers[1]

        roi = horse_mask[y_min:y_max, x_min:x_max]
        profile = np.mean(roi, axis=1) > 0.30
        local_y = wy - y_min

        if not (0 <= local_y < len(profile)):
            return withers[1]

        if profile[local_y]:
            for idx in range(local_y, -1, -1):
                if not profile[idx]:
                    return float(y_min + idx + 1)
        else:
            for idx in range(local_y, len(profile)):
                if profile[idx]:
                    return float(y_min + idx)

        return withers[1]

    def _calculate_scale(self, img):
        if not hasattr(cv2, "aruco"):
            return None

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        aruco_dict = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50)

        if hasattr(cv2.aruco, "ArucoDetector"):
            detector = cv2.aruco.ArucoDetector(
                aruco_dict, cv2.aruco.DetectorParameters()
            )
            corners, ids, _ = detector.detectMarkers(gray)
        else:
            corners, ids, _ = cv2.aruco.detectMarkers(gray, aruco_dict)

        if ids is None:
            return None

        for pts, marker_id in zip(corners, ids.flatten()):
            if int(marker_id) == 0:
                pts = pts.reshape(4, 2).astype(np.float32)
                perimeter = cv2.arcLength(pts.reshape(-1, 1, 2), True)
                if perimeter < self.aruco_min_perimeter:
                    continue

                sides = [
                    np.linalg.norm(pts[idx] - pts[(idx + 1) % 4]) for idx in range(4)
                ]
                min_side = min(sides)
                max_side = max(sides)

                if min_side <= 0 or (max_side / min_side) > self.aruco_max_distortion:
                    continue

                mean_side = float(np.mean(sides))
                return self.aruco_size_cm / mean_side
        return None

    def process(self, image_path):
        img = cv2.imread(str(image_path))
        if img is None:
            return None, None

        pixel_scale = self._calculate_scale(img)
        if not pixel_scale:
            return None, None

        horse_mask = self._get_horse_silhouette_mask(img)
        withers, knee = self._get_horse_body_points(img)
        if withers is None or knee is None:
            return None, None

        hoof_y = self._find_hoof_bottom_y(img, knee, horse_mask)
        if hoof_y is None:
            return None, None

        withers_y = self._refine_withers_y(withers, horse_mask)
        height_px = hoof_y - withers_y
        if height_px <= 0:
            return None, None

        height_cm = round(float(height_px * pixel_scale), 1)

        annotated = img.copy()
        wx, wy = int(round(withers[0])), int(round(withers_y))
        hy = int(round(hoof_y))

        cv2.line(annotated, (wx, wy), (wx, hy), (0, 0, 255), 10)

        out_dir = Path(settings.MEDIA_ROOT) / "ai_results"
        out_dir.mkdir(parents=True, exist_ok=True)
        out_path = out_dir / f"horse_{Path(image_path).stem}_measurement.jpg"

        cv2.putText(
            annotated,
            f"{height_cm:.1f} cm",
            (max(10, wx + 15), max(40, (wy + hy) // 2)),
            cv2.FONT_HERSHEY_SIMPLEX,
            5.0,
            (0, 0, 255),
            25,
            cv2.LINE_AA,
        )

        if not cv2.imwrite(str(out_path), annotated):
            return height_cm, None

        return height_cm, out_path


measurer = HorseMeasurer(
    "/mnt/c/Users/admin/Documents/SULI/szakdolgozat/Backend/ai_model/train_files/runs/pose/horse_pose_007/weights/best.pt",
    "/mnt/c/Users/admin/Documents/SULI/szakdolgozat/Backend/ai_model/train_files/runs/pose/hoof_pose/hoof_pose_001/weights/best.pt",
    "yolo26m-seg.pt",
)


def measure_horse(image_path):
    try:
        return measurer.process(image_path)
    except Exception as e:
        logger.error("Hiba a mérés során: %s", e, exc_info=True)
        return None, None
