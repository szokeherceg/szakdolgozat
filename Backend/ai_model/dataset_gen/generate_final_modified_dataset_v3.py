import json
import os
import random
import shutil
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import cv2
import kagglehub
import numpy as np
import pandas as pd
import yaml
from tqdm import tqdm
from ultralytics import YOLO


@dataclass
class Keypoint:
    x: float
    y: float
    v: int


RANDOM_SEED = 42
OUTPUT_DIR = Path("horse_yolo_pose_dataset_final_v3")
DEBUG_DIR = OUTPUT_DIR / "debug_visualizations"

DEBUG_LIMIT = 500
SPLIT_RATIO = 0.85
MIN_TOTAL_SCORE = 7
QUALITY_TIERS = ["excellent", "good", "fair"]

BBOX_PADDING = 0.08
HORSE_CATEGORY_ID = 4
KEYPOINT_COUNT = 16

SELECTED_ORIGINAL_INDICES = [2, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]

FLIP_IDX = [0, 2, 1, 4, 3, 6, 5, 8, 7, 10, 9, 12, 11, 13, 14, 15]

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


def bbox_iou_xywh(box_a: List[float], box_b: List[float]) -> float:
    box_a_x, box_a_y, box_a_w, box_a_h = box_a
    box_b_x, box_b_y, box_b_w, box_b_h = box_b
    
    if box_a_w <= 0 or box_a_h <= 0 or box_b_w <= 0 or box_b_h <= 0:
        return 0.0

    ax1, ay1, ax2, ay2 = box_a_x, box_a_y, box_a_x + box_a_w, box_a_y + box_a_h
    bx1, by1, bx2, by2 = box_b_x, box_b_y, box_b_x + box_b_w, box_b_y + box_b_h

    ix1 = max(ax1, bx1)
    iy1 = max(ay1, by1)
    ix2 = min(ax2, bx2)
    iy2 = min(ay2, by2)
    
    iw = max(0.0, ix2 - ix1)
    ih = max(0.0, iy2 - iy1)
    intersection = iw * ih

    if intersection <= 0.0:
        return 0.0
    union = box_a_w * box_a_h + box_b_w * box_b_h - intersection
    return float(intersection / union) if union > 0.0 else 0.0


def parse_keypoints(raw_kpts: Any) -> Optional[List[Keypoint]]:
    if not isinstance(raw_kpts, list):
        return None
    if len(raw_kpts) == 20 and all(isinstance(kp, (list, tuple)) and len(kp) >= 3 for kp in raw_kpts):
        parsed = raw_kpts
    elif len(raw_kpts) == 60:
        parsed = [raw_kpts[i:i + 3] for i in range(0, 60, 3)]
    else:
        return None

    keypoints = []
    for kp in parsed:
        try:
            x, y, v = float(kp[0]), float(kp[1]), int(kp[2])
        except (TypeError, ValueError, IndexError):
            return None
        if not np.isfinite(x) or not np.isfinite(y):
            return None
        if v not in (0, 1, 2):
            v = 1
        keypoints.append(Keypoint(x=x, y=y, v=v))
    return keypoints if len(keypoints) == 20 else None


def select_main_keypoints(original_keypoints: List[Keypoint]) -> Optional[List[Keypoint]]:
    if len(original_keypoints) != 20:
        return None
    return [
        Keypoint(
            x=original_keypoints[index].x,
            y=original_keypoints[index].y,
            v=original_keypoints[index].v,
        )
        for index in SELECTED_ORIGINAL_INDICES
    ]


def normalize_images(images_raw: Any) -> Dict[int, Dict[str, Any]]:
    result = {}
    if isinstance(images_raw, list):
        for item in images_raw:
            if not isinstance(item, dict):
                continue
            image_id = item.get("id", item.get("image_id"))
            if image_id is not None:
                try:
                    result[int(image_id)] = item
                except (TypeError, ValueError):
                    continue
    elif isinstance(images_raw, dict):
        for key, value in images_raw.items():
            if isinstance(value, dict):
                image_id = value.get("id", value.get("image_id", key))
                try:
                    result[int(image_id)] = value
                except (TypeError, ValueError):
                    continue
            elif isinstance(value, str):
                try:
                    image_id = int(key)
                except (TypeError, ValueError):
                    continue
                result[image_id] = {"id": image_id, "file_name": value}
    return result


def find_image(dataset_path: Path, file_name: str) -> Optional[Path]:
    file_name_path = Path(file_name)
    candidates = [
        dataset_path / file_name_path,
        dataset_path / "images" / file_name_path,
        dataset_path / "images" / "images" / file_name_path,
        dataset_path / "images" / "images" / file_name_path.name,
    ]
    for candidate in candidates:
        if candidate.exists() and candidate.is_file():
            return candidate
    matches = list(dataset_path.rglob(file_name_path.name))
    return matches[0] if matches else None


def load_quality_metrics(dataset_path: Path) -> Tuple[set, dict]:
    metrics_file = Path("dataset_statistics/keypoint_quality_metrics.csv")
    if not metrics_file.exists():
        metrics_file = dataset_path / "keypoint_quality_metrics.csv"
    if not metrics_file.exists():
        csv_files = list(dataset_path.rglob("keypoint_quality_metrics.csv"))
        if csv_files:
            metrics_file = csv_files[0]
        else:
            raise FileNotFoundError("Nem található keypoint_quality_metrics.csv.")

    metrics_df = pd.read_csv(metrics_file)
    metrics_df.columns = [str(c).strip().lower() for c in metrics_df.columns]
    if "annotation_id" in metrics_df.columns and "ann_id" not in metrics_df.columns:
        metrics_df = metrics_df.rename(columns={"annotation_id": "ann_id"})

    metrics_df = metrics_df.dropna(subset=["ann_id"])
    metrics_df["ann_id"] = metrics_df["ann_id"].astype(int)

    valid_tiers = [tier.lower() for tier in QUALITY_TIERS]
    valid_metrics = metrics_df[
        metrics_df["quality_tier"].astype(str).str.strip().str.lower().isin(valid_tiers)
        & (metrics_df["total_score"] >= MIN_TOTAL_SCORE)
    ]
    valid_ann_ids = set(valid_metrics["ann_id"].tolist())
    quality_lookup = {
        int(row["ann_id"]): (str(row["quality_tier"]), float(row["total_score"]))
        for _, row in valid_metrics.iterrows()
    }
    return valid_ann_ids, quality_lookup


def refine_bounding_box(
    image: np.ndarray,
    seg_model: Any,
    ann_bbox: List[float],
    keypoints: List[Keypoint],
) -> List[float]:
    img_h, img_w = image.shape[:2]
    results = seg_model(image, classes=[17], conf=0.25, verbose=False)
    boxes = np.empty((0, 4), dtype=np.float32)
    if results and results[0].boxes is not None:
        boxes = results[0].boxes.xywh.cpu().numpy()

    best_detection_bbox = None
    best_score = -1.0
    MIN_IOU_THRESHOLD = 0.15

    if len(boxes) > 0:
        for detection_box in boxes:
            dx, dy, dw, dh = map(float, detection_box[:4])
            yolo_bbox = [dx - dw / 2.0, dy - dh / 2.0, dw, dh]
            bbox_iou = bbox_iou_xywh(ann_bbox, yolo_bbox)
            if bbox_iou > best_score:
                best_score = bbox_iou
                best_detection_bbox = yolo_bbox

    if best_score < MIN_IOU_THRESHOLD:
        best_detection_bbox = None

    xmin, ymin, w_box, h_box = best_detection_bbox if best_detection_bbox is not None else map(float, ann_bbox)
    xmax, ymax = xmin + w_box, ymin + h_box
    
    valid_keypoints = [kp for kp in keypoints if kp.v > 0]
    if valid_keypoints:
        xmin = min(xmin, min(kp.x for kp in valid_keypoints))
        ymin = min(ymin, min(kp.y for kp in valid_keypoints))
        xmax = max(xmax, max(kp.x for kp in valid_keypoints))
        ymax = max(ymax, max(kp.y for kp in valid_keypoints))

    padding_x = (xmax - xmin) * BBOX_PADDING
    padding_y = (ymax - ymin) * BBOX_PADDING

    final_xmin = max(0.0, xmin - padding_x)
    final_ymin = max(0.0, ymin - padding_y)
    final_xmax = min(float(img_w), xmax + padding_x)
    final_ymax = min(float(img_h), ymax + padding_y)

    return [
        final_xmin,
        final_ymin,
        max(1.0, final_xmax - final_xmin),
        max(1.0, final_ymax - final_ymin),
    ]


def filter_and_process_annotations(
    dataset_path: Path,
    annotations_raw: list,
    category_ids: list,
    images_info: dict,
    valid_ann_ids: set,
    quality_lookup: dict,
    seg_model: Any,
) -> Tuple[list, dict]:
    stats = {
        "total": 0,
        "trash_dropped": 0,
        "quality_dropped": 0,
        "invalid_keypoint": 0,
        "invalid_bbox": 0,
    }
    processed_samples = []
    counter = 0

    for ann in tqdm(annotations_raw, desc="Filtering annotations"):
        if not isinstance(ann, dict):
            continue
        try:
            cat_id = int(ann.get("category_id", 0))
        except (TypeError, ValueError):
            continue
        if cat_id not in category_ids:
            continue

        counter += 1
        ann_id = int(ann.get("id", counter))
        if ann_id not in valid_ann_ids:
            stats["quality_dropped"] += 1
            continue

        img_id = ann.get("image_id")
        if img_id is None or int(img_id) not in images_info:
            stats["trash_dropped"] += 1
            continue
        
        img_id = int(img_id)
        file_name = images_info[img_id].get("file_name")
        if not file_name or Path(file_name).name in TRASH_LIST:
            stats["trash_dropped"] += 1
            continue

        img_path = find_image(dataset_path, file_name)
        if img_path is None:
            stats["trash_dropped"] += 1
            continue

        orig_kpts = parse_keypoints(ann.get("keypoints", []))
        keypoints = select_main_keypoints(orig_kpts) if orig_kpts else None
        if keypoints is None:
            stats["invalid_keypoint"] += 1
            continue

        orig_bbox = ann.get("bbox", [])
        if len(orig_bbox) != 4:
            stats["invalid_bbox"] += 1
            continue

        image = cv2.imread(str(img_path))
        if image is None:
            stats["trash_dropped"] += 1
            continue

        final_bbox = refine_bounding_box(image, seg_model, orig_bbox, keypoints)
        
        q_tier, total_score = quality_lookup.get(ann_id, ("good", 7.0))
        processed_samples.append({
            "image_path": img_path, "image_id": img_id, "ann_id": ann_id,
            "bbox": final_bbox, "keypoints": keypoints, "quality_tier": q_tier, "total_score": total_score
        })

    stats["total"] = len(processed_samples)
    return processed_samples, stats


def create_dataset_files(processed_samples: list) -> Tuple[int, int]:
    image_to_samples = {}
    for sample in processed_samples:
        image_to_samples.setdefault(sample["image_id"], []).append(sample)

    unique_image_ids = list(image_to_samples.keys())
    random.shuffle(unique_image_ids)
    split_index = int(len(unique_image_ids) * SPLIT_RATIO)
    train_image_ids = set(unique_image_ids[:split_index])

    for split in ["train", "val"]:
        (OUTPUT_DIR / "images" / split).mkdir(parents=True, exist_ok=True)
        (OUTPUT_DIR / "labels" / split).mkdir(parents=True, exist_ok=True)
    DEBUG_DIR.mkdir(parents=True, exist_ok=True)

    debug_saved_count, written_label_count = 0, 0
    expected_length = 5 + KEYPOINT_COUNT * 3

    for img_id, samples in tqdm(image_to_samples.items(), desc="Writing dataset"):
        split = "train" if img_id in train_image_ids else "val"
        sample_img_path = samples[0]["image_path"]
        img = cv2.imread(str(sample_img_path))
        if img is None:
            continue

        img_h, img_w = img.shape[:2]
        new_img_filename = f"{img_id}_{sample_img_path.name}"
        dest_img_path = OUTPUT_DIR / "images" / split / new_img_filename
        shutil.copyfile(str(sample_img_path), str(dest_img_path))

        yolo_label_lines = []
        debug_img = img.copy() if debug_saved_count < DEBUG_LIMIT else None

        for sample in samples:
            bx, by, bw, bh = sample["bbox"]
            xc, yc = (bx + bw / 2.0) / img_w, (by + bh / 2.0) / img_h
            norm_w, norm_h = bw / img_w, bh / img_h

            line_parts = [0, xc, yc, norm_w, norm_h]
            for kp in sample["keypoints"]:
                if kp.v == 0:
                    line_parts.extend([0.0, 0.0, 0.0])
                else:
                    nx = float(np.clip(kp.x / img_w, 0.0, 1.0))
                    ny = float(np.clip(kp.y / img_h, 0.0, 1.0))
                    line_parts.extend([nx, ny, float(kp.v)])

            if len(line_parts) != expected_length:
                continue
            yolo_label_lines.append(" ".join(map(str, line_parts)))

            if debug_img is not None:
                cv2.rectangle(debug_img, (int(bx), int(by)), (int(bx + bw), int(by + bh)), (0, 255, 0), 2)
                for kp_idx, kp in enumerate(sample["keypoints"]):
                    if kp.v > 0:
                        cv2.circle(debug_img, (int(kp.x), int(kp.y)), 4, (0, 255, 0), -1)
                        cv2.putText(debug_img, str(kp_idx), (int(kp.x) + 5, int(kp.y) - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 0), 1)

        if not yolo_label_lines:
            continue

        dest_label_path = OUTPUT_DIR / "labels" / split / f"{Path(new_img_filename).stem}.txt"
        with open(dest_label_path, "w", encoding="utf-8") as f:
            f.write("\n".join(yolo_label_lines))
        written_label_count += 1

        if debug_img is not None and debug_saved_count < DEBUG_LIMIT:
            cv2.imwrite(str(DEBUG_DIR / f"debug_{new_img_filename}"), debug_img)
            debug_saved_count += 1

    return debug_saved_count, written_label_count


def generate_yaml():
    yaml_data = {
        "path": str(OUTPUT_DIR.resolve()),
        "train": "images/train",
        "val": "images/val",
        "nc": 1,
        "names": {0: "horse"},
        "kpt_shape": [KEYPOINT_COUNT, 3],
        "flip_idx": FLIP_IDX,
    }
    yaml_path = OUTPUT_DIR / "horse.yaml"
    with open(yaml_path, "w", encoding="utf-8") as f:
        yaml.dump(yaml_data, f, sort_keys=False, allow_unicode=True)
    return yaml_path


def main():
    random.seed(RANDOM_SEED)
    np.random.seed(RANDOM_SEED)

    if OUTPUT_DIR.exists():
        raise FileExistsError(f"A kimeneti mappa már létezik: {OUTPUT_DIR.resolve()}")

    dataset_path = Path(kagglehub.dataset_download("bloodaxe/animal-pose-dataset"))
    
    annotations_file = dataset_path / "keypoints.json"
    if not annotations_file.exists():
        json_candidates = list(dataset_path.rglob("keypoints.json"))
        if json_candidates:
            annotations_file = json_candidates[0]
        else:
            raise FileNotFoundError(f"A keypoints.json nem található ebben a mappában: {dataset_path}")

    with open(annotations_file, "r", encoding="utf-8") as f:
        coco_data = json.load(f)

    if not isinstance(coco_data, dict) or "annotations" not in coco_data:
        raise ValueError("A megnyitott JSON nem érvényes COCO annotációs szerkezetű.")

    images_info = normalize_images(coco_data.get("images", {}))
    annotations_raw = coco_data.get("annotations", [])
    valid_ann_ids, quality_lookup = load_quality_metrics(dataset_path)

    category_ids = []
    if "categories" in coco_data:
        for cat in coco_data["categories"]:
            if "horse" in str(cat.get("name", "")).lower():
                category_ids.append(int(cat["id"]))
    if not category_ids:
        category_ids = [HORSE_CATEGORY_ID]

    seg_model = YOLO("yolo26x-seg.pt")

    processed_samples, stats = filter_and_process_annotations(
        dataset_path, annotations_raw, category_ids, images_info, valid_ann_ids, quality_lookup, seg_model
    )

    debug_count, written_label_count = create_dataset_files(processed_samples)
    yaml_path = generate_yaml()

    print(f"\nDataset sikeresen elkészült!")
    print(f"Összes mintaszám: {stats['total']}")
    print(f"Létrehozott label fájlok: {written_label_count}")
    print(f"Konfigurációs YAML: {yaml_path}")


if __name__ == "__main__":
    main()