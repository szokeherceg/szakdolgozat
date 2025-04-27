import { useNavigate } from "react-router-dom";
import { Image } from "../image/image";
import HomePagesvg from "./../../assets/homepage.svg";
import WhiteHorse from "./../../assets/whitehorse.svg";
import X from "./../../assets/whitex.svg";

import { Dropdown } from "../dropdown/dropdown";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Modal } from "../../pages/modal/modal";
import { Settings } from "../../pages";

import "./side-bar.css";

interface SideBarProps {
  setIsOpen: (isOpen: boolean) => void;
}

export const SideBar = ({ setIsOpen }: SideBarProps) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {}, [i18n.language]);

  return (
    <div className="side-bar">
      <div className="menu-container">
        <strong className="menu">{t("menu")}</strong>
        <Image
          src={X}
          height="30px"
          width="30px"
          className="menu-icon"
          onClick={() => setIsOpen(false)}
        />
      </div>

      <ul className="w-full space-y-4">
        <li className="sidebar-link" onClick={() => navigate("/MainPage")}>
          <Image height="24px" width="24px" src={HomePagesvg} />
          <span>{t("mainpage")}</span>
        </li>

        <li>
          <Dropdown
            buttonLabel={
              <span className="sidebar-link">
                <Image height="24px" width="24px" src={WhiteHorse} />
                {t("horses")}
              </span>
            }
            items={[
              {
                label: t("myhorses"),
                onClick: () => navigate("/HorsesList"),
              },
              {
                label: t("addhorse"),

                onClick: () => navigate("/AddHorse"),
              },
              {
                label: t("AI"),
                onClick: () => navigate("/AI"),
              },
            ]}
          />
        </li>
      </ul>
      <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}>
        <Settings onClose={() => setIsSettingsOpen(false)} />
      </Modal>
    </div>
  );
};
