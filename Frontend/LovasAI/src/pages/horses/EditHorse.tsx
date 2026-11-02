import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import { Button, HorseFields, PageLayout } from "../../components";
import { HorseFormData, HorseModel } from "../../models";
import { apiUrl } from "../../utils/api";
import { createHorseSchema, horseDefaultValues } from "../../utils/validation";

import "react-datepicker/dist/react-datepicker.css";

const horseSchema = createHorseSchema(true);

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

export const EditHorse = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm<HorseFormData>({
    resolver: yupResolver(horseSchema),
    defaultValues: horseDefaultValues,
  });
  const { setValue } = form;

  useEffect(() => {
    const fetchHorse = async () => {
      if (!id) {
        toast.error(t("could_not_save"));
        return;
      }

      try {
        const { data: horse } = await axios.get<HorseModel>(
          `${apiUrl}/horse-data/${id}/`,
        );

        [...textFields, "chip_number" as const].forEach((key) => {
          setValue(key, horse[key] ?? "");
        });
        setValue("birth_date", horse.birth_date?.slice(0, 10) ?? "");
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
      const formData = new FormData();

      textFields.forEach((key) => {
        formData.append(key, data[key] ?? "");
      });

      if (data.image && data.image.length > 0) {
        formData.append("image", data.image[0]);
      }

      await axios.patch(`${apiUrl}/horse-data/${id}/`, formData);

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
    <PageLayout className="ai-form" onSubmit={form.handleSubmit(onSubmit)}>
      <h2>{t("edit_data")}</h2>

      <HorseFields form={form} isEdit />

      <div className="edit-horse-buttons">
        <Button type="button" onClick={() => navigate("/HorsesList")}>
          {t("back")}
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? t("saving") : t("save")}
        </Button>
      </div>
    </PageLayout>
  );
};
