import type {
  ButtonHTMLAttributes,
  FormEventHandler,
  InputHTMLAttributes,
  ReactNode,
  Ref,
} from "react";
import type { FieldError, UseFormReturn } from "react-hook-form";
import type { SelectInstance } from "react-select";
import type {
  HorseFormData,
  MeasurementFormData,
  SelectOption,
} from "./form.model";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export interface DropdownItem {
  label: ReactNode;
  onClick: () => void;
  className?: string;
}

export interface DropdownProps {
  buttonLabel: ReactNode;
  items: DropdownItem[];
  className?: string;
}

export interface FormSetUpProps {
  children: ReactNode;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  className?: string;
}

export interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export interface SideBarProps {
  setIsOpen: (open: boolean) => void;
}

export interface ImageProps {
  src?: string;
  height?: string;
  width?: string;
  className?: string;
  onClick?: () => void;
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  srcShow?: string;
  srcHide?: string;
  ref?: Ref<HTMLInputElement>;
}

export interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  inputId?: string;
  name?: string;
  onBlur?: () => void;
  isClearable?: boolean;
  isSearchable?: boolean;
  ref?: Ref<SelectInstance<SelectOption>>;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export interface SettingsProps {
  onClose: () => void;
  onUpdated?: () => void;
}

export interface ForgotPasswordModalProps {
  onClose: () => void;
}

export interface FieldErrorProps {
  message?: string;
}

export interface FormFieldProps {
  id: string;
  label: ReactNode;
  error?: FieldError;
  hint?: ReactNode;
  children: ReactNode;
}

export interface DateInputProps {
  id: string;
  value?: string;
  onChange: (value: string) => void;
}

export interface PageLayoutProps {
  className: string;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  isLoading?: boolean;
  children?: ReactNode;
}

export interface LanguageSelectorProps {
  value: string;
  onChange: (language: string) => void;
}

export interface HorseFieldsProps {
  form: UseFormReturn<HorseFormData>;
  isEdit?: boolean;
}

export interface MeasurementFieldsProps {
  form: UseFormReturn<MeasurementFormData>;
  isEdit?: boolean;
}
