import type { InferType } from "yup";
import type {
  createHorseSchema,
  createMeasurementSchema,
} from "../utils/validation";

export interface SelectOption {
  value: string | number | boolean;
  label: string;
}

export type HorseFormData = InferType<ReturnType<typeof createHorseSchema>>;

export type MeasurementFormData = InferType<
  ReturnType<typeof createMeasurementSchema>
>;

export type SettingsFormData = {
  email: string;
  password: string;
  name: string;
  language: string;
};

export type ResetPasswordFormData = {
  password: string;
  password2: string;
};

export type SignInFormData = {
  email: string;
  password: string;
};

export type SignUpFormData = {
  email: string;
  name: string;
  password: string;
  password2: string;
  lang: string;
};
