import ReactSelect from "react-select";
import { SelectProps } from "../../../models";
import "./select.css";

export const Select = ({
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
}: SelectProps) => {
  return (
    <ReactSelect
      ref={ref}
      inputId={inputId}
      name={name}
      options={options}
      value={options.find((option) => String(option.value) === value) ?? null}
      onChange={(option) => onChange(String(option?.value ?? ""))}
      onBlur={onBlur}
      placeholder={placeholder}
      isClearable={isClearable}
      isSearchable={isSearchable}
      className="select"
      classNamePrefix="select"
    />
  );
};
