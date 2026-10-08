from pathlib import Path

import albumentations as A
from ultralytics import YOLO


SCRIPT_DIR = Path(__file__).resolve().parent
AI_MODEL_DIR = SCRIPT_DIR.parent

MODEL_PATH = (
    AI_MODEL_DIR
    / "train_files"
    / "runs"
    / "pose"
    / "horse_pose_006"
    / "weights"
    / "best.pt"
)

DATASET_YAML = (
    AI_MODEL_DIR
    / "dataset_gen"
    / "horse_yolo_pose_dataset_final_v2_modified"
    / "horse.yaml"
)

RUNS_DIR = AI_MODEL_DIR / "train_files" / "runs" / "pose"
RUN_NAME = "horse_pose_006_finetune_video_v1"


HORSE_ALBU = A.Compose(
    [
        A.OneOf(
            [
                A.CoarseDropout(
                    num_holes_range=(1, 3),
                    hole_height_range=(0.015, 0.06),
                    hole_width_range=(0.015, 0.06),
                    fill="random_uniform",
                    p=1.0,
                ),
                A.CoarseDropout(
                    num_holes_range=(1, 2),
                    hole_height_range=(0.025, 0.08),
                    hole_width_range=(0.015, 0.05),
                    fill="random_uniform",
                    p=1.0,
                ),
                A.Erasing(
                    scale=(0.015, 0.055),
                    ratio=(0.5, 2.0),
                    fill="random_uniform",
                    p=1.0,
                ),
            ],
            p=0.14,
        ),
        A.OneOf(
            [
                A.RandomBrightnessContrast(
                    brightness_limit=(-0.16, 0.10),
                    contrast_limit=(-0.14, 0.16),
                    p=1.0,
                ),
                A.RandomGamma(
                    gamma_limit=(82, 112),
                    p=1.0,
                ),
                A.ColorJitter(
                    brightness=(0.80, 1.05),
                    contrast=(0.82, 1.14),
                    saturation=(0.82, 1.10),
                    hue=(-0.012, 0.012),
                    p=1.0,
                ),
            ],
            p=0.45,
        ),
        A.OneOf(
            [
                A.RandomShadow(
                    shadow_roi=(0.0, 0.0, 1.0, 1.0),
                    num_shadows_limit=(1, 2),
                    shadow_dimension=5,
                    p=1.0,
                ),
                A.PlasmaShadow(
                    shadow_intensity_range=(0.12, 0.32),
                    p=1.0,
                ),
            ],
            p=0.15,
        ),
        A.OneOf(
            [
                A.RandomFog(
                    fog_coef_range=(0.04, 0.10),
                    alpha_coef=0.05,
                    p=1.0,
                ),
                A.RandomRain(
                    slant_range=(-4, 4),
                    drop_length=10,
                    drop_width=1,
                    brightness_coefficient=0.90,
                    rain_type="drizzle",
                    p=1.0,
                ),
                A.RandomSnow(
                    snow_point_range=(0.04, 0.10),
                    brightness_coeff=1.20,
                    p=1.0,
                ),
            ],
            p=0.025,
        ),
        A.OneOf(
            [
                A.GaussianBlur(
                    blur_limit=(3, 5),
                    p=1.0,
                ),
                A.MotionBlur(
                    blur_limit=(3, 5),
                    p=1.0,
                ),
            ],
            p=0.12,
        ),
        A.OneOf(
            [
                A.GaussNoise(
                    std_range=(0.005, 0.025),
                    p=1.0,
                ),
                A.ISONoise(
                    color_shift=(0.004, 0.014),
                    intensity=(0.025, 0.08),
                    p=1.0,
                ),
                A.ShotNoise(
                    p=1.0,
                ),
            ],
            p=0.08,
        ),
        A.ImageCompression(
            quality_range=(75, 97),
            p=0.12,
        ),
    ],
    p=0.65,
)


model = YOLO(str(MODEL_PATH))

model.train(
    data=str(DATASET_YAML),
    imgsz=1280,
    batch=6,
    epochs=300,
    patience=90,
    seed=42,
    deterministic=True,
    device=0,
    workers=8,
    freeze=0,
    optimizer="AdamW",
    lr0=0.00015,
    lrf=0.02,
    weight_decay=0.00025,
    warmup_epochs=5.0,
    warmup_momentum=0.80,
    warmup_bias_lr=0.01,
    box=3.5,
    cls=0.2,
    dfl=1.5,
    pose=40.0,
    kobj=3.5,
    hsv_h=0.005,
    hsv_s=0.30,
    hsv_v=0.30,
    degrees=3.0,
    translate=0.035,
    scale=0.08,
    shear=0.25,
    perspective=0.00001,
    flipud=0.0,
    fliplr=0.5,
    mosaic=0.10,
    close_mosaic=35,
    mixup=0.0,
    cutmix=0.0,
    copy_paste=0.0,
    erasing=0.08,
    auto_augment=None,
    val=True,
    plots=True,
    save=True,
    save_period=5,
    amp=True,
    project=str(RUNS_DIR),
    name=RUN_NAME,
    exist_ok=False,
)