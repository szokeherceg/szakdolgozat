from pathlib import Path

import albumentations as A
from ultralytics import YOLO

SCRIPT_DIR = Path(__file__).resolve().parent
AI_MODEL_DIR = SCRIPT_DIR.parent

MODEL_PATH = "yolo26n-pose.pt"

DATASET_YAML = AI_MODEL_DIR / "dataset_gen/horse_yolo_pose_dataset_final_v3/horse.yaml"

RUNS_DIR = AI_MODEL_DIR / "train_files/runs/pose"


if __name__ == "__main__":

    model = YOLO(MODEL_PATH)

    model.train(
        data=str(DATASET_YAML),
        imgsz=1280,
        batch=6,
        cache=False,
        epochs=300,
        patience=40,
        pretrained=True,
        seed=42,
        deterministic=True,
        device=0,
        workers=8,
        optimizer="AdamW",
        lr0=0.0005,
        lrf=0.01,
        weight_decay=0.001,
        dropout=0.1,
        warmup_epochs=3,
        warmup_momentum=0.8,
        warmup_bias_lr=0.1,
        box=5.0,
        cls=0.5,
        dfl=1.5,
        pose=20.0,
        kobj=2.0,
        degrees=10.0,
        translate=0.1,
        scale=0.3,
        shear=2.0,
        perspective=0.0001,
        fliplr=0.5,
        flipud=0.0,
        mosaic=0.5,
        mixup=0.1,
        erasing=0.2,
        close_mosaic=30,
        augmentations=[
            A.RandomBrightnessContrast(
                brightness_limit=0.25,
                contrast_limit=0.25,
                p=0.40,
            ),
            A.CLAHE(
                clip_limit=2.5,
                tile_grid_size=(8, 8),
                p=0.30,
            ),
            A.RandomGamma(
                gamma_limit=(75, 125),
                p=0.20,
            ),
            A.GaussianBlur(
                blur_limit=(3, 5),
                p=0.15,
            ),
        ],
        val=True,
        plots=True,
        save=True,
        save_period=10,
        amp=True,
        project=str(RUNS_DIR),
        name="horse_pose_007",
    )
