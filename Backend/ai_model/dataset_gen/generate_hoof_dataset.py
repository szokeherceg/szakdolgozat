from pathlib import Path
import json
import random
import shutil

import cv2
import numpy as np
import pandas as pd
import yaml
from tqdm import tqdm

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
    "Backend/ai_model/hoof_detection_dataset"
)

DEBUG_DIR = OUTPUT_DIR / "debug_visualizations"

HORSE_CATEGORY_ID = 4
TRAIN_RATIO = 0.85

HOOF_BOX_SCALE = 0.055
MIN_BOX_SIZE = 12
MAX_BOX_SIZE = 64

LEFT_FRONT_INDEX = 13
RIGHT_FRONT_INDEX = 14
LEFT_BACK_INDEX = 15
RIGHT_BACK_INDEX = 16

TRASH_LIST = set()


def parse_keypoints(values):
    return [
        [
            float(point[0]),
            float(point[1]),
            int(point[2]),
        ]
        for point in values
    ]


def create_hoof_box(
    x,
    y,
    horse_bbox,
    image_width,
    image_height,
):
    horse_width = float(horse_bbox[2])
    horse_height = float(horse_bbox[3])

    box_size = max(
        MIN_BOX_SIZE,
        min(
            MAX_BOX_SIZE,
            max(horse_width, horse_height) * HOOF_BOX_SCALE,
        ),
    )

    half = box_size / 2

    left = max(0.0, x - half)
    top = max(0.0, y - half)
    right = min(float(image_width), x + half)
    bottom = min(float(image_height), y + half)

    return left, top, right, bottom


def make_label(
    box,
    image_width,
    image_height,
):
    left, top, right, bottom = box

    box_width = right - left
    box_height = bottom - top

    center_x = (left + box_width / 2) / image_width

    center_y = (top + box_height / 2) / image_height

    width = box_width / image_width
    height = box_height / image_height

    return f"0 " f"{center_x:.6f} " f"{center_y:.6f} " f"{width:.6f} " f"{height:.6f}"


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

quality_data = quality_data[quality_data["legs_score"] > 0]

legs_scores = {
    int(row["ann_id"]): float(row["legs_score"]) for _, row in quality_data.iterrows()
}


samples = []

horse_annotation_index = 0
quality_annotation_count = 0


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

    if annotation_id not in legs_scores:
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

    image = cv2.imread(str(image_path))

    if image is None:
        continue

    image_height, image_width = image.shape[:2]

    keypoints = parse_keypoints(annotation["keypoints"])

    horse_bbox = annotation["bbox"]

    if horse_bbox[2] <= 30 or horse_bbox[3] <= 30:
        continue

    hoof_indices = [
        LEFT_FRONT_INDEX,
        RIGHT_FRONT_INDEX,
        LEFT_BACK_INDEX,
        RIGHT_BACK_INDEX,
    ]

    hoof_boxes = []

    for index in hoof_indices:
        x, y, visibility = keypoints[index]

        if visibility <= 0:
            continue

        if not (0 <= x < image_width and 0 <= y < image_height):
            continue

        hoof_box = create_hoof_box(
            x,
            y,
            horse_bbox,
            image_width,
            image_height,
        )

        hoof_boxes.append(hoof_box)

    if not hoof_boxes:
        continue

    samples.append(
        {
            "image_id": image_id,
            "image_path": image_path,
            "image_name": file_name,
            "width": image_width,
            "height": image_height,
            "boxes": hoof_boxes,
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

    first_sample = image_samples[0]

    image_path = first_sample["image_path"]

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
        for box in sample["boxes"]:
            label_lines.append(
                make_label(
                    box,
                    image_width,
                    image_height,
                )
            )

            left, top, right, bottom = box

            cv2.rectangle(
                debug_image,
                (int(left), int(top)),
                (int(right), int(bottom)),
                (0, 255, 0),
                2,
            )

    label_path = OUTPUT_DIR / "labels" / split / f"{Path(image_name).stem}.txt"

    with open(
        label_path,
        "w",
        encoding="utf-8",
    ) as file:
        file.write("\n".join(label_lines))

    debug_path = DEBUG_DIR / f"debug_{image_name}"

    cv2.imwrite(
        str(debug_path),
        debug_image,
    )

    if split == "train":
        train_label_count += 1
    else:
        val_label_count += 1


yaml_data = {
    "path": str(OUTPUT_DIR.resolve()),
    "train": "images/train",
    "val": "images/val",
    "nc": 1,
    "names": {0: "hoof"},
}

with open(
    OUTPUT_DIR / "hoof.yaml",
    "w",
    encoding="utf-8",
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
