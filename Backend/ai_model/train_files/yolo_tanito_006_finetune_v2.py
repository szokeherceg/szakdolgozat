from pathlib import Path

from ultralytics import YOLO


SCRIPT_DIR = Path(__file__).resolve().parent
AI_MODEL_DIR = SCRIPT_DIR.parent

MODEL_PATH = (
    AI_MODEL_DIR
    / "train_files/runs/pose/horse_pose_006_finetune_video_v1-2/weights/best.pt"
)

DATASET_YAML = (
    AI_MODEL_DIR
    / "dataset_gen/horse_yolo_pose_dataset_final_v2_modified/horse.yaml"
)

RUNS_DIR = AI_MODEL_DIR / "train_files/runs/pose"


if __name__ == "__main__":

    model = YOLO(str(MODEL_PATH))

    model.train(
        data=str(DATASET_YAML),
        imgsz=1280,
        batch=6,
        cache=False,

        epochs=250,
        patience=70,
        pretrained=True,
        seed=42,
        deterministic=True,
        device=0,
        workers=8,

        optimizer="AdamW",
        lr0=0.00015,
        lrf=0.02,
        weight_decay=0.0003,
        warmup_epochs=5,
        warmup_momentum=0.8,
        warmup_bias_lr=0.01,

        box=3.0,
        cls=0.2,
        dfl=1.5,
        pose=60.0,
        kobj=5.0,

        hsv_h=0.008,
        hsv_s=0.35,
        hsv_v=0.30,

        degrees=5.0,
        translate=0.07,
        scale=0.16,
        shear=0.4,
        perspective=0.00002,

        fliplr=0.5,
        flipud=0.0,

        mosaic=0.15,
        mixup=0.03,
        cutmix=0.0,
        copy_paste=0.0,

        erasing=0.1,
        close_mosaic=20,

        val=True,
        plots=True,
        save=True,
        save_period=5,
        amp=True,

        project=str(RUNS_DIR),
        name="horse_pose_006_finetune_v2",
    )