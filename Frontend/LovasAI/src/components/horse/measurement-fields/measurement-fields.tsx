import { useTranslation } from "react-i18next";
import { FormField } from "../../ui/form-field/form-field";
import { Input } from "../../ui/input/input";
import { DateInput } from "../../ui/date-input/date-input";
import { MeasurementFieldsProps } from "../../../models";

const numericFields = ["height", "weight", "girth", "cannon_girth"] as const;

export const MeasurementFields = ({
  form,
  isEdit = false,
}: MeasurementFieldsProps) => {
  const { t } = useTranslation();
  const {
    register,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = form;

  const measuredAt = watch("measured_at");

  return (
    <>
      <FormField
        id="measured_at"
        label={isEdit ? t("measurement_date") : `${t("measurement_date")} *`}
        error={errors.measured_at}
      >
        <DateInput
          id="measured_at"
          value={measuredAt}
          onChange={(value) => {
            setValue("measured_at", value, {
              shouldValidate: true,
              shouldDirty: true,
            });
            clearErrors("measured_at");
          }}
        />
        <input type="hidden" {...register("measured_at")} />
      </FormField>

      {numericFields.map((name) => (
        <FormField key={name} id={name} label={t(name)} error={errors[name]}>
          <Input
            id={name}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder={t(name)}
            {...register(name)}
          />
        </FormField>
      ))}

      <FormField
        id="image"
        label={t("measurement_image")}
        error={errors.image}
        hint={
          !isEdit && (
            <p className="measurement-image-hint">
              {t("measurement_image_hint")}
            </p>
          )
        }
      >
        <Input
          id="image"
          type="file"
          accept="image/jpeg,image/png"
          className="draganddrop"
          {...register("image")}
        />
      </FormField>
    </>
  );
};
