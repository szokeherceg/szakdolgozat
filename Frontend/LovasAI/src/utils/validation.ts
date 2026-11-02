import * as yup from "yup";
import { formatDate } from "./date";

export const MIN_PASSWORD_LENGTH = 15;
export const MAX_USER_NAME_LENGTH = 30;

const WEAK_PASSWORDS = ["jelszo", "password", "qwerty", "admin"];

export const isWeakPassword = (password: string) =>
  WEAK_PASSWORDS.some((weakPassword) =>
    password.toLowerCase().includes(weakPassword),
  );

export const isValidEmail = (email: string) =>
  yup.string().email().isValidSync(email);

const SERVER_MESSAGE_KEYS: Record<string, string> = {
  "week-password": "weak_password",
};

export const serverMessage = (value: unknown) => {
  const message = String(Array.isArray(value) ? value[0] : value);
  return SERVER_MESSAGE_KEYS[message] ?? message;
};

const IMAGE_TYPES = ["image/jpeg", "image/png"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const imageFile = () =>
  yup
    .mixed<FileList>()
    .optional()
    .test("fileType", "invalid_file_type", (value) => {
      if (!value || value.length === 0) return true;
      return IMAGE_TYPES.includes(value[0].type);
    })
    .test("fileSize", "file_too_large", (value) => {
      if (!value || value.length === 0) return true;
      return value[0].size <= MAX_IMAGE_SIZE;
    });

const text = (maxLength: number) =>
  yup.string().trim().max(maxLength, "too_long").optional();

const notInFuture = <T extends yup.StringSchema<string | undefined>>(
  schema: T,
) =>
  schema.test(
    "notInFuture",
    "date_in_future",
    (value) => !value || value.slice(0, 10) <= formatDate(new Date()),
  );

export const createHorseSchema = (isEdit: boolean) =>
  yup.object({
    name: text(255).required("required_name"),
    chip_number: text(100).test(
      "required",
      "required_chip_number",
      (value) => isEdit || !!value,
    ),
    owner: text(255).required("required_owner"),
    stable_name: text(255),
    studbook_number: text(100),
    birth_date: notInFuture(yup.string().optional()),
    gender: yup.string().optional(),
    color: yup.string().optional(),
    is_healthy: yup
      .boolean()
      .transform((value, originalValue) =>
        originalValue === "" || originalValue == null ? undefined : value,
      )
      .optional(),
    markings: yup.string().optional(),
    branding: text(255),
    breeder: text(255),
    father: text(255),
    mother: text(255),
    maternal_grandsire: text(255),
    desc: yup.string().optional(),
    image: imageFile(),
  });

export const horseDefaultValues = {
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
};

const toNumber = (originalValue: unknown) => {
  if (originalValue == null) return null;
  if (typeof originalValue === "number") return originalValue;

  const normalized = String(originalValue).trim().replace(",", ".");
  return normalized === "" ? null : Number(normalized);
};

const measurementValue = (min: number, max: number, message: string) =>
  yup
    .number()
    .transform((_, originalValue) => toNumber(originalValue))
    .typeError("invalid_number")
    .nullable()
    .optional()
    .min(min, message)
    .max(max, message);

export const createMeasurementSchema = (isEdit: boolean) =>
  yup.object({
    measured_at: notInFuture(yup.string().required("required_field")),
    height: measurementValue(50, 175, "height_range"),
    weight: measurementValue(25, 900, "weight_range"),
    girth: measurementValue(40, 230, "girth_range"),
    cannon_girth: measurementValue(6, 32, "cannon_girth_range"),
    image: imageFile().test(
      "required",
      "file_required",
      (value) => isEdit || (value instanceof FileList && value.length > 0),
    ),
  });
