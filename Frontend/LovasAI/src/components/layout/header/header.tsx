import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { SideBar } from "../sidebar/sidebar";
import { Dropdown } from "../../ui/dropdown/dropdown";
import { Modal } from "../../ui/modal/modal";
import { Settings } from "../../../pages";
import { HeaderProps } from "../../../models";
import { apiUrl } from "../../../utils/api";
import { clearSession } from "../../../utils/auth";
import list from "./../../../assets/list.svg";
import Profilesvg from "./../../../assets/profile.svg";
import Settingssvg from "./../../../assets/settings.svg";

import "./header.css";

export const Header = ({ isSidebarOpen, setIsSidebarOpen }: HeaderProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userData, setUserData] = useState("");

  const toggleSideBar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${apiUrl}/user_details/`);
      setUserData(response.data.name);
    } catch (error) {
      console.error("User fetch failed", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogout = () => {
    clearSession();
    navigate("/SignIn");
  };

  return (
    <>
      <div className="header">
        <div className="list-button" onClick={toggleSideBar}>
          <img src={list} height="40px" width="40px" alt="Toggle Sidebar" />
        </div>
        <div className="profile">
          <Dropdown
            buttonLabel={
              <span className="sidebar-link">
                <img height="25px" width="25px" src={Profilesvg} />
                {userData || t("profile")}
              </span>
            }
            items={[
              {
                label: (
                  <>
                    <img height="25px" width="25px" src={Settingssvg} />{" "}
                    {t("settings")}
                  </>
                ),
                onClick: () => setIsSettingsOpen(true),
              },
              {
                label: t("logout"),
                className: "logout",
                onClick: handleLogout,
              },
            ]}
          />
        </div>
      </div>

      {isSidebarOpen && <SideBar setIsOpen={setIsSidebarOpen} />}

      <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}>
        <Settings
          onClose={() => setIsSettingsOpen(false)}
          onUpdated={fetchUser}
        />
      </Modal>
    </>
  );
};
