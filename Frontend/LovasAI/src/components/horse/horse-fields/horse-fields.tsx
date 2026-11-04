import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormField } from "../../ui/form-field/form-field";
import { Input } from "../../ui/input/input";
import { Select } from "../../ui/select/select";
import { DateInput } from "../../ui/date-input/date-input";
import {
  HorseFieldsProps,
  HorseFormData,
  InputProps,
  SelectOption,
} from "../../../models";

type TextFieldName = Exclude<
  keyof HorseFormData,
  "gender" | "is_healthy" | "color" | "image" | "birth_date"
>;
type SelectFieldName = "gender" | "is_healthy" | "color";

export const HorseFields = ({ form, isEdit = false }: HorseFieldsProps) => {
  const { t } = useTranslation();
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const color = watch("color");
  const birthDate = watch("birth_date");

  const genderOptions: SelectOption[] = [
    { value: "male", label: t("male") },
    { value: "female", label: t("female") },
    { value: "gelding", label: t("gelding") },
  ];

  const colorOptions: SelectOption[] = [
    { value: "bay", label: t("bay") },
    { value: "chestnut", label: t("chestnut") },
    { value: "black", label: t("black") },
    { value: "roan", label: t("roan") },
    { value: "other", label: t("other") },
  ];

  const isHealthyOptions: SelectOption[] = [
    { value: true, label: t("yes") },
    { value: false, label: t("no") },
  ];

  const readOnlyProps: InputProps = isEdit
    ? { readOnly: true, placeholder: undefined }
    : {};

  const textField = (
    name: TextFieldName,
    label: string = t(name),
    inputProps: InputProps = {},
  ) => (
    <FormField id={name} label={label} error={errors[name]}>
      <Input
        id={name}
        type="text"
        placeholder={t(name)}
        {...inputProps}
        {...register(name)}
      />
    </FormField>
  );

  const textareaField = (name: "markings" | "desc", label: string) => (
    <FormField id={name} label={label}>
      <textarea id={name} rows={3} placeholder={label} {...register(name)} />
    </FormField>
  );

  const selectField = (
    name: SelectFieldName,
    options: SelectOption[],
    placeholder: string,
    isClearable = true,
  ) => (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Select
          inputId={name}
          name={field.name}
          ref={field.ref}
          options={options}
          value={field.value == null ? "" : String(field.value)}
          onChange={field.onChange}
          onBlur={field.onBlur}
          placeholder={placeholder}
          isClearable={isClearable}
          isSearchable
        />
      )}
    />
  );

  return (
    <>
      {textField("name", `${t("name")} *`)}

      {isEdit
        ? textField("chip_number", t("chip_number"), readOnlyProps)
        : textField("chip_number", `${t("horse_chip_number")} *`, {
            placeholder: t("chip_number"),
          })}

      {textField("owner", `${t("owner")} *`)}
      {textField("stable_name")}
      {textField("studbook_number", t("studbook_number"), readOnlyProps)}

      <FormField
        id="birth_date"
        label={t("birth_date")}
        error={errors.birth_date}
      >
        <DateInput
          id="birth_date"
          value={birthDate}
          onChange={(value) =>
            setValue("birth_date", value, {
              shouldValidate: true,
              shouldDirty: true,
            })
          }
        />
        <input type="hidden" {...register("birth_date")} />
      </FormField>

      <FormField id="gender" label={t("gender")}>
        {selectField("gender", genderOptions, t("select_horse_sex"))}
      </FormField>

      <FormField
        id="is_healthy"
        label={t("is_healthy")}
        error={errors.is_healthy}
      >
        {selectField("is_healthy", isHealthyOptions, t("is_healthy"), false)}
      </FormField>

      <FormField id="color" label={t("color")}>
        {selectField("color", colorOptions, t("select_horse_color"))}
        {color === "other" && <p>{t("other_color_note")}</p>}
      </FormField>

      {textareaField("markings", t("markings"))}
      {textField("branding")}
      {textField("breeder")}
      {textField("father")}
      {textField("mother")}
      {textField("maternal_grandsire")}

      <FormField id="image" label={t("birth_photo")} error={errors.image}>
        <Input
          id="image"
          type="file"
          accept="image/jpeg,image/png"
          className="draganddrop"
          {...register("image")}
        />
      </FormField>

      {textareaField("desc", t("other_data"))}
    </>
  );
};
