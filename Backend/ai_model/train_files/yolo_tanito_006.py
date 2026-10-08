from pathlib import Path

import albumentations as A
from ultralytics import YOLO


SCRIPT_DIR = Path(__file__).resolve().parent
AI_MODEL_DIR = SCRIPT_DIR.parent

MODEL_PATH = "yolo26n-pose.pt"

DATASET_YAML = (
    AI_MODEL_DIR
    / "dataset_gen/horse_yolo_pose_dataset_final_v2_modified/horse.yaml"
)

RUNS_DIR = AI_MODEL_DIR / "train_files/runs/pose"


if __name__ == "__main__":

    model = YOLO(MODEL_PATH)

    model.train(
        # Dataset
        data=str(DATASET_YAML),
        imgsz=1280,
        batch=6,
        cache=False,

        # Training
        epochs=350,
        patience=100,
        pretrained=True,
        seed=42,
        deterministic=True,
        device=0,
        workers=8,

        # Optimizer / learning rate
        optimizer="AdamW",
        lr0=0.0005,
        lrf=0.02,
        weight_decay=0.0005,
        warmup_epochs=5,
        warmup_momentum=0.8,
        warmup_bias_lr=0.1,

        # Loss weights
        box=5.0,
        cls=0.2,
        dfl=1.5,
        pose=30.0,
        kobj=3.0,

        # HSV
        hsv_h=0.015,
        hsv_s=0.70,
        hsv_v=0.40,

        # Geometric augmentation
        degrees=8.0,
        translate=0.06,
        scale=0.20,
        shear=1.5,
        perspective=0.00005,

        # Flip
        fliplr=0.5,
        flipud=0.0,

        # Image mixing
        mosaic=0.30,
        mixup=0.0,
        cutmix=0.0,
        copy_paste=0.0,

        # Additional augmentation
        auto_augment="randaugment",
        erasing=0.0,
        close_mosaic=50,

        # Custom photometric augmentation
        augmentations=[
            A.RandomBrightnessContrast(
                brightness_limit=0.15,
                contrast_limit=0.20,
                p=0.30,
            ),
            A.CLAHE(
                clip_limit=2.0,
                tile_grid_size=(8, 8),
                p=0.10,
            ),
            A.RandomGamma(
                gamma_limit=(85, 115),
                p=0.15,
            ),
            A.GaussianBlur(
                blur_limit=(3, 3),
                p=0.02,
            ),
        ],

        # Validation / output
        val=True,
        plots=True,
        save=True,
        save_period=10,
        amp=True,

        project=str(RUNS_DIR),
        name="horse_pose_006",
    )