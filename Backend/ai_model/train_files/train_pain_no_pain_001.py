from pathlib import Path
from ultralytics import YOLO


DATASET = "/mnt/c/Users/admin/Documents/SULI/szakdolgozat/Backend/ai_model/dataset_gen/haf_pain_cls_final_v2"
MODEL = "yolo26s-cls.pt"

PROJECT = "/mnt/c/Users/admin/Documents/SULI/szakdolgozat/Backend/ai_model/train_files/runs/classify"
RUN_NAME = "haf_pain_001"


if __name__ == "__main__":

    model = YOLO(MODEL)

    model.train(
        data=DATASET,

        epochs=100,
        imgsz=512,
        batch=16,

        device=0,
        workers=4,

        optimizer="AdamW",

        lr0=0.0005,
        lrf=0.01,

        weight_decay=0.001,

        freeze=8,

        warmup_epochs=5.0,
        warmup_momentum=0.8,
        warmup_bias_lr=0.05,

        fliplr=0.5,
        flipud=0.0,

        degrees=5.0,
        translate=0.05,
        scale=0.15,

        shear=2.0,
        perspective=0.0003,

        hsv_h=0.02,
        hsv_s=0.25,
        hsv_v=0.20,

        bgr=0.1,
        label_smoothing=0.05,

        mosaic=0.0,
        mixup=0.0,
        cutmix=0.0,

        auto_augment=None,

        erasing=0.20,

        pretrained=True,

        seed=42,
        deterministic=True,

        patience=20,

        save=True,
        plots=True,
        val=True,

        project=PROJECT,
        name=RUN_NAME,
    )
