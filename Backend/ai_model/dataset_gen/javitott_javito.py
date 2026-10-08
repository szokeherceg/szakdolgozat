import csv
import json
from pathlib import Path

from tqdm import tqdm

DATASET_DIR = Path(
    "/mnt/c/Users/admin/.cache/kagglehub/datasets/"
    "bloodaxe/animal-pose-dataset/versions/1"
)

OUTPUT_DIR = Path(
    "/mnt/c/Users/admin/Documents/SULI/szakdolgozat/"
    "Backend/ai_model/dataset_gen/dataset_statistics"
)

OUTPUT_CSV = OUTPUT_DIR / "keypoint_quality_metrics.csv"


HORSE_CATEGORY_ID = 4

TORSO_KPS = [5, 6, 19]
HEAD_KPS = [0, 1, 2, 3, 4]

LEG_GROUPS = [
    [7, 8, 9],
    [10, 11, 12],
    [13, 14, 15],
    [16, 17, 18],
]


def parse_keypoints(values):
    return [[float(point[0]), float(point[1]), int(point[2])] for point in values]


with open(DATASET_DIR / "keypoints.json", "r", encoding="utf-8") as file:
    data = json.load(file)


images = data["images"]
annotations = data["annotations"]


if isinstance(images, dict):
    images_info = {int(image_id): image_info for image_id, image_info in images.items()}
else:
    images_info = {int(image["id"]): image for image in images}


horse_annotations = [
    annotation
    for annotation in annotations
    if int(annotation["category_id"]) == HORSE_CATEGORY_ID
]


results = []


for annotation_index, annotation in enumerate(
    tqdm(
        horse_annotations,
        desc="Anatómiai pontozás",
    ),
    start=1,
):
    image_id = int(annotation["image_id"])

    image_info = images_info[image_id]

    if isinstance(image_info, dict):
        image_name = image_info["file_name"]
    else:
        image_name = image_info

    image_name = Path(image_name).name

    annotation_id = int(
        annotation.get(
            "id",
            annotation_index,
        )
    )

    keypoints = parse_keypoints(annotation["keypoints"])

    visibilities = [point[2] for point in keypoints]

    visible_count = sum(1 for visibility in visibilities if visibility > 0)

    well_visible_count = sum(1 for visibility in visibilities if visibility == 2)

    keypoints_score = min(
        5,
        visible_count // 3,
    )

    torso_visible = sum(
        1
        for index in TORSO_KPS
        if index < len(visibilities) and visibilities[index] > 0
    )

    torso_score = min(
        3,
        torso_visible,
    )

    head_visible = sum(
        1 for index in HEAD_KPS if index < len(visibilities) and visibilities[index] > 0
    )

    head_score = 1 if head_visible >= 2 else 0

    complete_legs = 0.0

    for leg in LEG_GROUPS:
        leg_visible = sum(
            1 for index in leg if index < len(visibilities) and visibilities[index] > 0
        )

        if leg_visible == 3:
            complete_legs += 1.0
        elif leg_visible == 2:
            complete_legs += 0.5

    legs_score = round(complete_legs * 1.5)

    total_score = keypoints_score + torso_score + head_score + legs_score

    if visible_count < 8:
        quality_tier = "poor"
    elif total_score >= 14 and well_visible_count >= 10 and complete_legs >= 3.0:
        quality_tier = "excellent"
    elif total_score >= 11:
        quality_tier = "good"
    elif total_score >= 9 and visible_count >= 10:
        quality_tier = "fair"
    else:
        quality_tier = "poor"

    results.append(
        {
            "annotation_id": annotation_id,
            "image_id": image_id,
            "image_name": image_name,
            "total_score": total_score,
            "quality_tier": quality_tier,
            "visible_count": visible_count,
            "keypoints_score": keypoints_score,
            "torso_score": torso_score,
            "head_score": head_score,
            "legs_score": legs_score,
        }
    )


OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


fieldnames = [
    "annotation_id",
    "image_id",
    "image_name",
    "total_score",
    "quality_tier",
    "visible_count",
    "keypoints_score",
    "torso_score",
    "head_score",
    "legs_score",
]


with open(
    OUTPUT_CSV,
    "w",
    newline="",
    encoding="utf-8",
) as file:
    writer = csv.DictWriter(
        file,
        fieldnames=fieldnames,
    )

    writer.writeheader()
    writer.writerows(results)


print(f"Kész: {OUTPUT_CSV}")
print(f"Feldolgozott annotációk: {len(results)}")
