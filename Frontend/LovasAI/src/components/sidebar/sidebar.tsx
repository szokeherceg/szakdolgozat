import { useNavigate } from "react-router-dom";
import { Image } from "../image/image";

import Profilesvg from "./../../assets/profile.svg";
import HomePagesvg from "./../../assets/homepage.svg";
import WhiteHorse from "./../../assets/whitehorse.svg";
import X from "./../../assets/whitex.svg";

import "./side-bar.css";
import { Dropdown } from "../dropdown/dropdown";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

interface SideBarProps {
  setIsOpen: (isOpen: boolean) => void;
}

export const SideBar = ({ setIsOpen }: SideBarProps) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    console.log("Nyelv változott:", i18n.language);
  }, [i18n.language]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    navigate("/");
  };

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
                <Image height="24px" width="24px" src={Profilesvg} />
                {t("profile")}
              </span>
            }
            items={[
              {
                label: t("settings"),
                onClick: () => navigate("/Settings"),
              },
              {
                label: t("logout"),
                className: "logout",
                onClick: handleLogout,
              },
            ]}
          />
        </li>{" "}
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
                label: "AI",
                onClick: () => navigate("/AI"),
              },
            ]}
          />
        </li>
      </ul>
    </div>
  );
};
