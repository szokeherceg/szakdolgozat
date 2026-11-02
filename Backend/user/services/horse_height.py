import logging
from pathlib import Path

import cv2
import numpy as np
from django.conf import settings
from ultralytics import YOLO

logger = logging.getLogger(__name__)


class HorseMeasurer:
    def __init__(self, horse_path):
        self.horse_model = YOLO(horse_path)

    def _calculate_scale(self, img):
        dictionary = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50)
        detector = cv2.aruco.ArucoDetector(dictionary, cv2.aruco.DetectorParameters())

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        corners, ids, _ = detector.detectMarkers(gray)

        if ids is None or len(ids) == 0:
            return None

        best = None
        for marker_corners, marker_id in zip(corners, ids.flatten()):
            if int(marker_id) != 0:
                continue

            points = marker_corners.reshape(4, 2).astype(np.float32)
            sides = [
                float(np.linalg.norm(points[(i + 1) % 4] - points[i])) for i in range(4)
            ]

            if min(sides) <= 0:
                continue

            area = abs(cv2.contourArea(points.reshape(-1, 1, 2)))
            cm_per_pixel = 20.0 / float(np.mean(sides))

            if best is None or area > best["area"]:
                best = {
                    "area": area,
                    "cm_per_pixel": cm_per_pixel,
                }

        return best["cm_per_pixel"] if best else None

    def process(self, image_path):
        img = cv2.imread(str(image_path))
        cm_per_pixel = self._calculate_scale(img)

        result = self.horse_model.predict(
            source=img,
            imgsz=864,
            conf=0.5,
            iou=0.85,
            device=0,
            verbose=False,
        )[0]

        best_idx = int(np.argmax(result.boxes.conf.cpu().numpy()))
        points = result.keypoints.xy.cpu().numpy()[best_idx]

        withers = points[12]

        front_feet = []
        for idx in (4, 7):
            x, y = points[idx]
            if x > 0 and y > 0:
                front_feet.append((float(x), float(y), idx))

        _, foot_y, _ = max(front_feet, key=lambda point: point[1])

        withers_x = int(round(float(withers[0])))
        withers_y = int(round(float(withers[1])))
        foot_y_int = int(round(foot_y))

        height_px = abs(foot_y_int - withers_y)
        height_cm = round(float(height_px * cm_per_pixel), 1)

        annotated = img.copy()
        red = (0, 0, 255)

        out_dir = Path(settings.MEDIA_ROOT) / "ai_results"
        out_dir.mkdir(parents=True, exist_ok=True)
        out_path = out_dir / f"horse_{Path(image_path).stem}_measurement.jpg"
        cv2.line(
            annotated,
            (withers_x, withers_y),
            (withers_x, foot_y_int),
            red,
            10,
        )

        cv2.putText(
            annotated,
            f"{height_cm:.1f} cm",
            (withers_x + 15, (withers_y + foot_y_int) // 2),
            cv2.FONT_HERSHEY_SIMPLEX,
            5.0,
            red,
            25,
            cv2.LINE_AA,
        )

        cv2.imwrite(str(out_path), annotated)

        return height_cm, str(out_path)


HORSE_MODEL_PATH = "/mnt/c/Users/admin/Documents/SULI/szakdolgozat/Backend/ai_model/train_files/runs/pose/horse_pose_015-4/weights/best.pt"

measurer = HorseMeasurer(str(HORSE_MODEL_PATH))


def measure_horse(image_path):
    try:
        return measurer.process(image_path)
    except Exception as e:
        logger.error("Hiba a mérés során: %s", e, exc_info=True)
        return None, None
