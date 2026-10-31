#!/usr/bin/env python3
import shutil
import random
from pathlib import Path
import pandas as pd
import numpy as np
import cv2
import yaml
from tqdm import tqdm
from ultralytics import YOLO

BASE_DIR = Path("/mnt/c/Users/admin/Documents/SULI/szakdolgozat/Backend")
DOWNLOADS = Path("/mnt/c/Users/admin/Downloads")

HORSE10_RAW_DIR = BASE_DIR / "horse10_raw" / "horse10"
CVAT_BASE = DOWNLOADS / "kaggle_re_annotated"

OUTPUT_DIR = BASE_DIR / "ai_model" / "dataset_gen" / "horse_dataset"
DEBUG_DIR = OUTPUT_DIR / "debug_visualizations"
KEYPOINT_COUNT = 22
CRITICAL_POINTS = [0, 4, 7, 15, 20, 16]
BBOX_PADDING = 0.08

FLIP_IDX = [0, 1, 5, 6, 7, 2, 3, 4, 8, 9, 10, 11, 12, 18, 19, 20, 16, 17, 13, 14, 15, 21]
SIGMAS = [0.028, 0.028, 0.035, 0.018, 0.018, 0.035, 0.018, 0.018, 0.035, 0.022, 
          0.022, 0.022, 0.016, 0.035, 0.018, 0.018, 0.035, 0.035, 0.035, 0.018, 0.018, 0.035]


def refine_bbox(image, seg_model, initial_bbox, points):
    h, w = image.shape[:2]
    x, y, box_w, box_h = initial_bbox
    best_box = None
    best_iou = 0.0

    predictions = seg_model.predict(source=image, conf=0.25, classes=[17], verbose=False)

    if predictions and predictions[0].boxes is not None:
        for box in predictions[0].boxes.xyxy.cpu().numpy():
            x1, y1, x2, y2 = box
            
            cand_w, cand_h = x2 - x1, y2 - y1
            ix1, iy1 = max(x, x1), max(y, y1)
            ix2, iy2 = min(x + box_w, x2), min(y + box_h, y2)
            inter = max(0, ix2 - ix1) * max(0, iy2 - iy1)
            union = (box_w * box_h) + (cand_w * cand_h) - inter
            iou = inter / union if union > 0 else 0
            
            if iou > best_iou:
                best_iou = iou
                best_box = box

    if best_box is not None and best_iou >= 0.15:
        x1, y1, x2, y2 = best_box
    else:
        x1, y1, x2, y2 = x, y, x + box_w, y + box_h

    for px, py in points:
        if px is not None and py is not None:
            x1, y1 = min(x1, px), min(y1, py)
            x2, y2 = max(x2, px), max(y2, py)

    box_w, box_h = x2 - x1, y2 - y1
    x1 = max(0, min(w - 1, x1 - box_w * BBOX_PADDING))
    y1 = max(0, min(h - 1, y1 - box_h * BBOX_PADDING))
    x2 = max(x1 + 1, min(w, x2 + box_w * BBOX_PADDING))
    y2 = max(y1 + 1, min(h, y2 + box_h * BBOX_PADDING))

    return x1, y1, x2 - x1, y2 - y1


def load_cvat_data():
    samples = []
    
    lbl_dir = CVAT_BASE / "labels" / "train" / "images"
    img_dir = CVAT_BASE / "images"
    
    if not lbl_dir.exists():
        print("CVAT mappa nem található, átugrás...")
        return samples

    for lbl_path in tqdm(list(lbl_dir.iterdir()), desc="CVAT olvasása"):
        if lbl_path.suffix != ".txt" or lbl_path.name in ["classes.txt", "train.txt", "val.txt", "test.txt"]:
            continue
            
        text = lbl_path.read_text(encoding="utf-8-sig").strip()
        if not text:
            continue

        img_path = img_dir / f"{lbl_path.stem}.jpg"
        if not img_path.exists() and "_" in lbl_path.stem:
            img_path = img_dir / f"{lbl_path.stem.split('_', 1)[1]}.jpg"
            
        vals = [float(v) for v in text.splitlines()[0].split()]
        img = cv2.imread(str(img_path))
        if img is None: 
            continue
            
        h, w = img.shape[:2]
        cx, cy, bw, bh = vals[1:5]
        bbox = ((cx - bw / 2) * w, (cy - bh / 2) * h, bw * w, bh * h)
        
        points = []
        for i in range(KEYPOINT_COUNT):
            idx = 5 + i * 3
            if idx + 2 < len(vals):
                px, py, pv = vals[idx], vals[idx+1], vals[idx+2]
                if pv > 0:
                    points.append((px * w, py * h))
                else:
                    points.append((None, None))
            else:
                points.append((None, None))

        samples.append({
            "source": "cvat",
            "name": lbl_path.stem,
            "image_path": img_path,
            "bbox": bbox,
            "points": points
        })
        
    return samples

def load_horse10_data():
    samples = []
    seen = set()
    
    csv_files = sorted(HORSE10_RAW_DIR.rglob("*.csv"))
    for csv_path in tqdm(csv_files, desc="Horse-10 CSV-k olvasása"):
        folder = csv_path.parent
        
        if folder.name in {"labeled-data", "Sample13"}:
            continue

        try:
            df = pd.read_csv(csv_path, skiprows=3, header=None)
        except (pd.errors.EmptyDataError, FileNotFoundError): 
            continue

        img_map = {p.stem: p for p in folder.rglob("*") if p.is_file() and p.suffix.lower() in {".jpg", ".jpeg", ".png"}}

        for _, row in df.iterrows():
            img_name = str(row.iloc[0]).strip()
            if not img_name or img_name.lower() == "nan": 
                continue
            
            img_path = img_map.get(Path(img_name).stem) or img_map.get(Path(img_name).name)
            if img_path is None: 
                continue
            
            img_id = str(img_path.resolve())
            if img_id in seen: 
                continue

            raw = row.iloc[1:].tolist()
            pts = []
            
            max_idx = min(len(raw) - (len(raw) % 2), KEYPOINT_COUNT * 2)
            for i in range(0, max_idx, 2):
                x = pd.to_numeric(raw[i], errors="coerce")
                y = pd.to_numeric(raw[i + 1], errors="coerce")
                pts.append((None, None) if pd.isna(x) or pd.isna(y) else (float(x), float(y)))

            if len(pts) != KEYPOINT_COUNT or any(pts[i][0] is None for i in CRITICAL_POINTS): 
                continue

            vis = [(x, y) for x, y in pts if x is not None]
            if len(vis) < 2: 
                continue
            
            xs, ys = zip(*vis)
            x1, y1 = max(0, min(xs)), max(0, min(ys))
            x2, y2 = max(xs), max(ys)
            if x2 <= x1 or y2 <= y1: 
                continue

            samples.append({
                "source": "horse10",
                "folder": folder.name,
                "name": img_path.stem,
                "image_path": img_path,
                "bbox": (x1, y1, x2 - x1, y2 - y1),
                "points": pts
            })
            seen.add(img_id)
            
    return samples


def main():
    random.seed(42)
    np.random.seed(42)

    print("Adatok beolvasása indul...")
    cvat_samples = load_cvat_data()
    horse10_samples = load_horse10_data()

    print(f"CVAT képek: {len(cvat_samples)} | Horse-10: {len(horse10_samples)}\n")

    folders = sorted(list(set(s["folder"] for s in horse10_samples)))
    random.shuffle(folders)
    split_point = int(len(folders) * 0.85)
    train_folders = set(folders[:split_point])

    horse10_train = [s for s in horse10_samples if s["folder"] in train_folders][::10]
    horse10_val = [s for s in horse10_samples if s["folder"] not in train_folders][::10]

    cvat_train = [s for i, s in enumerate(cvat_samples) if i % 3 != 0]
    cvat_val = [s for i, s in enumerate(cvat_samples) if i % 3 == 0]

    if OUTPUT_DIR.exists():
        shutil.rmtree(OUTPUT_DIR, ignore_errors=True)
        
    for d in ["train", "val"]:
        (OUTPUT_DIR / "images" / d).mkdir(parents=True)
        (OUTPUT_DIR / "labels" / d).mkdir(parents=True)
    DEBUG_DIR.mkdir(parents=True, exist_ok=True)

    seg_model = YOLO("yolo26x-seg.pt")

    stats = {"train_c": 0, "train_h": 0, "val_c": 0, "val_h": 0}
    debug_cnt = 0

    for split, data_list, oversample in [
        ("train", cvat_train, 10), 
        ("train", horse10_train, 1),
        ("val", cvat_val, 1), 
        ("val", horse10_val, 1)
    ]:
        for sample in tqdm(data_list, desc=f"{split.upper()} feldolgozása"):
            img = cv2.imread(str(sample["image_path"]))
            if img is None: 
                continue
                
            img_h, img_w = img.shape[:2]
            rx, ry, rw, rh = refine_bbox(img, seg_model, sample["bbox"], sample["points"])
            
            parts = [0, round((rx + rw / 2) / img_w, 6), round((ry + rh / 2) / img_h, 6), round(rw / img_w, 6), round(rh / img_h, 6)]
            for px, py in sample["points"]:
                if px is None:
                    parts.extend([0.0, 0.0, 0.0])
                else:
                    parts.extend([round(np.clip(px / img_w, 0, 1), 6), round(np.clip(py / img_h, 0, 1), 6), 2.0])

            yolo_line = " ".join(map(str, parts))
            
            arr = np.array(parts, dtype=float)
            if not np.isfinite(arr).all() or np.any(arr[1:5] < 0) or np.any(arr[1:5] > 1.05):
                continue

            for repeat in range(oversample):
                stem = f"{sample['folder']}_{sample['name']}" if sample["source"] == "horse10" else sample['name']
                if oversample > 1:
                    stem += f"_{repeat}"

                shutil.copyfile(sample["image_path"], OUTPUT_DIR / "images" / split / f"{stem}{sample['image_path'].suffix.lower()}")
                (OUTPUT_DIR / "labels" / split / f"{stem}.txt").write_text(yolo_line + "\n", encoding="utf-8")
                
                stat_key = f"{split}_{'c' if sample['source'] == 'cvat' else 'h'}"
                stats[stat_key] += 1

                if repeat == 0 and split == "train" and debug_cnt < 200:
                    dbg = img.copy()
                    cv2.rectangle(dbg, (int(rx), int(ry)), (int(rx + rw), int(ry + rh)), (0, 255, 0), 2)
                    for pt in sample["points"]:
                        if pt[0] is not None:
                            cv2.circle(dbg, (int(pt[0]), int(pt[1])), 2, (0, 0, 255), -1)
                    cv2.imwrite(str(DEBUG_DIR / f"{stem}.jpg"), dbg)
                    debug_cnt += 1

    yaml_config = {
        "path": str(OUTPUT_DIR.resolve()),
        "train": "images/train",
        "val": "images/val",
        "nc": 1,
        "names": {0: "horse"},
        "kpt_shape": [KEYPOINT_COUNT, 3],
        "flip_idx": FLIP_IDX,
        "kpt_oks_sigmas": SIGMAS,
    }
    
    with open(OUTPUT_DIR / "horse_dataset.yaml", "w", encoding="utf-8") as f:
        yaml.dump(yaml_config, f, sort_keys=False, allow_unicode=True)

    print(f"\nÖsszes train: {stats['train_c'] + stats['train_h']} (CVAT: {stats['train_c']}, Horse-10: {stats['train_h']})")
    print(f"Összes val:   {stats['val_c'] + stats['val_h']} (CVAT: {stats['val_c']}, Horse-10: {stats['val_h']})")

if __name__ == "__main__":
    main()