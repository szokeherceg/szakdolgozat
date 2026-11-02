import DatePicker from "react-datepicker";
import { useTranslation } from "react-i18next";
import { DateInputProps } from "../../../models";
import { formatDate, parseDate } from "../../../utils/date";

export const DateInput = ({ id, value, onChange }: DateInputProps) => {
  const { t } = useTranslation();

  return (
    <DatePicker
      id={id}
      selected={value ? parseDate(value) : null}
      onChange={(date: Date | null) => onChange(date ? formatDate(date) : "")}
      maxDate={new Date()}
      dateFormat="yyyy-MM-dd"
      placeholderText={t("datetimeformat")}
      className="date-picker-input"
      autoComplete="off"
    />
  );
};
