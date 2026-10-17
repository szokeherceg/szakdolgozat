import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import classNames from "classnames";

import { FormSetUp, Input, Button, Header, Select } from "../components";
import { DataNameModel } from "../models";

import "./registration/registration.css";

const apiUrl = import.meta.env.VITE_BASE_URL;

const horseSchema = yup.object({
  name: yup.string().required("required_name"),
  chip_number: yup.string().optional(),
  owner: yup.string().required("required_owner"),
  stable_name: yup.string().optional(),
  studbook_number: yup.string().optional(),
  birth_date: yup.string().optional(),
  gender: yup.string().optional(),
  color: yup.string().optional(),
  markings: yup.string().optional(),
  branding: yup.string().optional(),
  breeder: yup.string().optional(),
  father: yup.string().optional(),
  mother: yup.string().optional(),
  maternal_grandsire: yup.string().optional(),
  desc: yup.string().optional(),
  image: yup
    .mixed<FileList>()
    .optional()
    .test("fileType", "invalid_file_type", (value) => {
      if (!value || value.length === 0) return true;
      return ["image/jpeg", "image/png"].includes(value[0].type);
    })
    .test("fileSize", "file_too_large", (value) => {
      if (!value || value.length === 0) return true;
      return value[0].size <= 5 * 1024 * 1024;
    }),
});

type HorseFormData = yup.InferType<typeof horseSchema>;

export const EditHorse = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<HorseFormData>({
    resolver: yupResolver(horseSchema),
    defaultValues: {
      name: "",
      chip_number: "",
      owner: "",
      stable_name: "",
      studbook_number: "",
      birth_date: "",
      gender: "",
      color: "",
      markings: "",
      branding: "",
      breeder: "",
      father: "",
      mother: "",
      maternal_grandsire: "",
      desc: "",
    },
  });

  const color = watch("color");

  const genderOptions = [
    { value: "male", label: t("male") },
    { value: "female", label: t("female") },
    { value: "gelding", label: t("gelding") },
  ];

  const colorOptions = [
    { value: "bay", label: t("bay") },
    { value: "chestnut", label: t("chestnut") },
    { value: "black", label: t("black") },
    { value: "grey", label: t("grey") },
    { value: "dun", label: t("dun") },
    { value: "roan", label: t("roan") },
    { value: "other", label: t("other") },
  ];

  useEffect(() => {
    const fetchHorse = async () => {
      try {
        const token =
          localStorage.getItem(DataNameModel.ACCESS_TOKEN) ||
          localStorage.getItem(DataNameModel.REFRESH_TOKEN);

        if (!token || !id) {
          toast.error(t("could_not_save"));
          return;
        }

        const response = await axios.get(`${apiUrl}/horse-data/${id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const horse = response.data;

        setValue("name", horse.name ?? "");
        setValue("chip_number", horse.chip_number ?? "");
        setValue("owner", horse.owner ?? "");
        setValue("stable_name", horse.stable_name ?? "");
        setValue("studbook_number", horse.studbook_number ?? "");
        setValue("birth_date", horse.birth_date ?? "");
        setValue("gender", horse.gender ?? "");
        setValue("color", horse.color ?? "");
        setValue("markings", horse.markings ?? "");
        setValue("branding", horse.branding ?? "");
        setValue("breeder", horse.breeder ?? "");
        setValue("father", horse.father ?? "");
        setValue("mother", horse.mother ?? "");
        setValue("maternal_grandsire", horse.maternal_grandsire ?? "");
        setValue("desc", horse.desc ?? "");
      } catch (error) {
        console.error("Failed to fetch horse data:", error);
        toast.error(t("could_not_save"));
      }
    };

    fetchHorse();
  }, [id, setValue, t]);

  const onSubmit = async (data: HorseFormData) => {
    if (!id) return;

    setLoading(true);

    try {
      const token =
        localStorage.getItem(DataNameModel.ACCESS_TOKEN) ||
        localStorage.getItem(DataNameModel.REFRESH_TOKEN);

      if (!token) {
        toast.error(t("missing_token"));
        return;
      }

      const formData = new FormData();

      const textFields = [
        "name",
        "owner",
        "stable_name",
        "studbook_number",
        "birth_date",
        "gender",
        "color",
        "markings",
        "branding",
        "breeder",
        "father",
        "mother",
        "maternal_grandsire",
        "desc",
      ] as const;

      textFields.forEach((key) => {
        formData.append(key, data[key] ?? "");
      });

      if (data.image && data.image.length > 0) {
        formData.append("image", data.image[0]);
      }

      await axios.patch(`${apiUrl}/horse-data/${id}/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(t("data_saved_successfully"));
      navigate("/HorsesList");
    } catch (error) {
      console.error("Error while updating horse data:", error);
      toast.error(t("update_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <FormSetUp
        onSubmit={handleSubmit(onSubmit)}
        className={classNames("ai-form", {
          "form-shifted": isSidebarOpen,
          "form-centered": !isSidebarOpen,
        })}
      >
        <h2>{t("edit_data")}</h2>

        <div className="input-group">
          <label htmlFor="name">{t("name")} *</label>
          <Input
            id="name"
            type="text"
            placeholder={t("name")}
            {...register("name")}
          />
          {errors.name && (
            <p className="errors">{t(errors.name.message ?? "")}</p>
          )}
        </div>

        <div className="input-group">
          <label htmlFor="chip_number">{t("chip_number")}</label>
          <Input
            id="chip_number"
            type="text"
            readOnly
            {...register("chip_number")}
          />
        </div>

        <div className="input-group">
          <label htmlFor="owner">{t("owner")} *</label>
          <Input
            id="owner"
            type="text"
            placeholder={t("owner")}
            {...register("owner")}
          />
          {errors.owner && (
            <p className="errors">{t(errors.owner.message ?? "")}</p>
          )}
        </div>

        <div className="input-group">
          <label htmlFor="stable_name">{t("stable_name")}</label>
          <Input
            id="stable_name"
            type="text"
            placeholder={t("stable_name")}
            {...register("stable_name")}
          />
        </div>

        <div className="input-group">
          <label htmlFor="studbook_number">{t("studbook_number")}</label>
          <Input
            id="studbook_number"
            type="text"
            readOnly
            {...register("studbook_number")}
          />
        </div>

        <div className="input-group">
          <label htmlFor="birth_date">{t("birth_date")}</label>
          <Input
            id="birth_date"
            type="date"
            {...register("birth_date")}
          />
        </div>

        <div className="input-group">
          <label htmlFor="gender">{t("gender")}</label>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <Select
                inputId="gender"
                name={field.name}
                options={genderOptions}
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder={t("select_horse_sex")}
                isClearable
                isSearchable
              />
            )}
          />
        </div>

        <div className="input-group">
          <label htmlFor="color">{t("color")}</label>
          <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <Select
                inputId="color"
                name={field.name}
                options={colorOptions}
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder={t("select_horse_color")}
                isClearable
                isSearchable
              />
            )}
          />
          {color === "other" && <p>{t("other_color_note")}</p>}
        </div>

        <div className="input-group">
          <label htmlFor="markings">{t("markings")}</label>
          <textarea
            id="markings"
            rows={3}
            placeholder={t("markings")}
            {...register("markings")}
          />
        </div>

        <div className="input-group">
          <label htmlFor="branding">{t("branding")}</label>
          <Input
            id="branding"
            type="text"
            placeholder={t("branding")}
            {...register("branding")}
          />
        </div>

        <div className="input-group">
          <label htmlFor="breeder">{t("breeder")}</label>
          <Input
            id="breeder"
            type="text"
            placeholder={t("breeder")}
            {...register("breeder")}
          />
        </div>

        <div className="input-group">
          <label htmlFor="father">{t("father")}</label>
          <Input
            id="father"
            type="text"
            placeholder={t("father")}
            {...register("father")}
          />
        </div>

        <div className="input-group">
          <label htmlFor="mother">{t("mother")}</label>
          <Input
            id="mother"
            type="text"
            placeholder={t("mother")}
            {...register("mother")}
          />
        </div>

        <div className="input-group">
          <label htmlFor="maternal_grandsire">
            {t("maternal_grandsire")}
          </label>
          <Input
            id="maternal_grandsire"
            type="text"
            placeholder={t("maternal_grandsire")}
            {...register("maternal_grandsire")}
          />
        </div>

        <div className="input-group">
          <label htmlFor="image">{t("birth_photo")}</label>
          <Input
            id="image"
            type="file"
            accept="image/jpeg,image/png"
            className="draganddrop"
            {...register("image")}
          />
          {errors.image && (
            <p className="errors">{t(errors.image.message ?? "")}</p>
          )}
        </div>

        <div className="input-group">
          <label htmlFor="desc">{t("other_data")}</label>
          <textarea
            id="desc"
            rows={3}
            placeholder={t("other_data")}
            {...register("desc")}
          />
        </div>

        <div className="edit-horse-buttons">
          <Button type="button" onClick={() => navigate("/HorsesList")}>
            {t("back")}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? t("saving") : t("save")}
          </Button>
        </div>
      </FormSetUp>
    </>
  );
};
