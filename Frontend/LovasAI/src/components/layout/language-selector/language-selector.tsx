import { useTranslation } from "react-i18next";
import { Dropdown } from "../../ui/dropdown/dropdown";
import { DataNameModel, LanguageSelectorProps } from "../../../models";

export const LanguageSelector = ({ value, onChange }: LanguageSelectorProps) => {
  const { t } = useTranslation();

  return (
    <div className="language">
      <Dropdown
        buttonLabel={value}
        items={[
          {
            label: t("hungarian"),
            onClick: () => onChange(DataNameModel.HUNGARIAN),
          },
          {
            label: t("english"),
            onClick: () => onChange(DataNameModel.ENGLISH),
          },
        ]}
      />
    </div>
  );
};
