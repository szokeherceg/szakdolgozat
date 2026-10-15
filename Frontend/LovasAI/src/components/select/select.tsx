import React from "react";
import ReactSelect from "react-select";
import type { Ref } from "react";
import "./select.css";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  inputId?: string;
  name?: string;
  onBlur?: () => void;
  isClearable?: boolean;
  isSearchable?: boolean;
  ref?: Ref<any>;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  inputId,
  name,
  onBlur,
  isClearable = true,
  isSearchable = true,
  ref,
}) => {
  return (
    <ReactSelect
      ref={ref}
      inputId={inputId}
      name={name}
      options={options}
      value={options.find((option) => option.value === value) ?? null}
      onChange={(option) => onChange(option?.value ?? "")}
      onBlur={onBlur}
      placeholder={placeholder}
      isClearable={isClearable}
      isSearchable={isSearchable}
      className="select"
      classNamePrefix="select"
    />
  );
};
