
from pathlib import Path

import albumentations as A
import cv2
from ultralytics import YOLO

SCRIPT_DIR = Path(__file__).resolve().parent
RUNS_DIR = SCRIPT_DIR / "runs/pose"
DATASET_YAML = SCRIPT_DIR.parent / "dataset_gen/horse_dataset/horse_dataset.yaml"
MODEL_PATH = "yolo26s-pose.pt"


AUGS = [
    A.RandomShadow(
        shadow_roi=(0, 0.2, 1, 1),
        num_shadows_limit=(1, 2),
        shadow_dimension=8,
        shadow_intensity_range=(0.3, 0.5),
        p=0.15
    ),

    A.RandomBrightnessContrast(
        brightness_limit=(-0.10, 0.20),
        contrast_limit=(-0.10, 0.20),
        p=0.35
    ),

    A.RandomGamma(
        gamma_limit=(85, 120),
        p=0.20
    ),

    A.CLAHE(
        clip_limit=(1.5, 2.5),
        p=0.10
    ),

    A.ColorJitter(
        brightness=0.0,
        contrast=0.0,
        saturation=0.2,
        hue=0.04,
        p=0.10
    ),

    A.ToGray(p=0.03),

    A.Sharpen(
        alpha=(0.2, 0.4),
        lightness=(0.9, 1.1),
        p=0.20
    ),

    A.OneOf([
        A.Downscale(
            scale_range=(0.6, 0.85),
            interpolation_pair={
                "upscale": cv2.INTER_LINEAR,
                "downscale": cv2.INTER_AREA
            },
            p=1.0
        ),
        A.GaussianBlur(
            blur_limit=(3, 5),
            p=1.0
        ),
        A.MotionBlur(
            blur_limit=3,
            p=1.0
        ),
    ], p=0.05),

    A.OneOf([
        A.GaussNoise(
            std_range=(0.02, 0.04),
            p=1.0
        ),
        A.ISONoise(
            color_shift=(0.01, 0.03),
            intensity=(0.1, 0.25),
            p=1.0
        ),
        A.ImageCompression(
            quality_range=(60, 95),
            p=1.0
        ),
    ], p=0.15),
]


if __name__ == "__main__":
    model = YOLO(MODEL_PATH)

    model.train(
        data=str(DATASET_YAML),
        project=str(RUNS_DIR),
        name="horse_pose_015",

        imgsz=864,
        batch=9,
        epochs=250,
        patience=50,

        cache=True,
        workers=8,
        device=0,
        seed=42,
        amp=True,
        deterministic=False,

        optimizer="AdamW",
        lr0=0.0002,
        lrf=0.02,
        cos_lr=True,
        weight_decay=0.0005,
        warmup_epochs=5,

        box=7.5,
        cls=0.5,
        dfl=1.5,
        pose=20.0,
        kobj=1.5,
        rle=1.0,

        scale=0.35,
        translate=0.10,
        degrees=5.0,
        fliplr=0.5,

        mosaic=0.3,
        close_mosaic=50,

        hsv_h=0.015,
        hsv_s=0.4,
        hsv_v=0.25,

        auto_augment=None,
        erasing=0.0,
        augmentations=AUGS,

        val=True,
        plots=True,
        save_period=10,
    )
