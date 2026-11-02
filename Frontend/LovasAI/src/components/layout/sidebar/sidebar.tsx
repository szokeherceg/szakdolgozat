import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Image } from "../../ui/image/image";
import { Dropdown } from "../../ui/dropdown/dropdown";
import { SideBarProps } from "../../../models";
import HomePagesvg from "./../../../assets/homepage.svg";
import WhiteHorse from "./../../../assets/whitehorse.svg";
import X from "./../../../assets/whitex.svg";

import "./sidebar.css";

export const SideBar = ({ setIsOpen }: SideBarProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

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

      <ul>
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
            ]}
          />
        </li>
      </ul>
    </div>
  );
};
