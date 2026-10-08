from ultralytics import YOLO
from pathlib import Path


MODEL_PATH = "yolo26n-pose.pt"
SCRIPT_DIR = Path(__file__).resolve().parent
AI_MODEL_DIR = SCRIPT_DIR.parent

MODEL_PATH = "yolo26n-pose.pt"
DATASET_YAML = AI_MODEL_DIR / "dataset_gen/hoof_detection_dataset/hoof.yaml"

PROJECT_NAME = "hoof_pose"
RUN_NAME = "hoof_pose_001"

if __name__ == "__main__":

    model = YOLO(MODEL_PATH)

    model.train(
        data=DATASET_YAML,

        imgsz=1280,
        batch=6,

        epochs=250,
        patience=60,

        pretrained=True,

        seed=42,
        deterministic=True,

        device=0,
        workers=8,

        optimizer="AdamW",

        lr0=0.0005,
        lrf=0.02,

        weight_decay=0.0005,

        momentum=0.8,
        warmup_epochs=5,
        warmup_momentum=0.8,
        warmup_bias_lr=0.1,

        degrees=5.0,
        translate=0.08,
        scale=0.35,

        shear=2.0,
        perspective=0.0,

        fliplr=0.5,
        flipud=0.0,

        hsv_h=0.015,
        hsv_s=0.7,
        hsv_v=0.4,

        mosaic=0.5,
        mixup=0.0,
        cutmix=0.0,

        copy_paste=0.0,

        auto_augment="randaugment",
        erasing=0.2,

        close_mosaic=30,

        project=PROJECT_NAME,
        name=RUN_NAME,

        save=True,
        save_period=10,

        plots=True,
        verbose=True,
    )
