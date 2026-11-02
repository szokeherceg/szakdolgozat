import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import { Button, HorseFields, PageLayout } from "../../components";
import { HorseFormData } from "../../models";
import { apiUrl } from "../../utils/api";
import { createHorseSchema, horseDefaultValues } from "../../utils/validation";

import "react-datepicker/dist/react-datepicker.css";

const horseSchema = createHorseSchema(false);

export const AddHorse = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm<HorseFormData>({
    resolver: yupResolver(horseSchema),
    defaultValues: horseDefaultValues,
  });

  const onSubmit = async (data: HorseFormData) => {
    setLoading(true);

    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (key === "image") {
          if (value instanceof FileList && value.length > 0) {
            formData.append("image", value[0]);
          }
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      const response = await axios.post(`${apiUrl}/horse-data/`, formData);
      const horseId = response.data.id;

      if (!horseId) {
        throw new Error("The created horse ID was not returned.");
      }

      await axios.post(`${apiUrl}/user-horses/`, { horse_id: horseId });

      toast.success(t("data_saved_successfully"));
      navigate("/HorsesList");
    } catch (error) {
      console.error("Error while saving horse data:", error);

      if (axios.isAxiosError(error) && error.response?.data?.chip_number) {
        form.setError("chip_number", {
          type: "server",
          message: "horse_already_exist",
        });
        form.setFocus("chip_number");
      } else {
        toast.error(t("could_not_save"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout className="ai-form" onSubmit={form.handleSubmit(onSubmit)}>
      <h2>{t("addhorse")}</h2>

      <HorseFields form={form} />

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
