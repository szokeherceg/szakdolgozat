import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { SideBar } from "../sidebar/sidebar";
import list from "./../../assets/list.svg";
import { Dropdown } from "../dropdown/dropdown";
import { Modal } from "../../pages/modal/Modal";
import { Settings } from "../../pages";
import Profilesvg from "./../../assets/profile.svg";
import Settingssvg from "./../../assets/settings.svg";
import axios from "axios";
import { DataNameModel } from "../../models";

import "./header.css";

const apiUrl = import.meta.env.VITE_BASE_URL;

interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export const Header = ({ isSidebarOpen, setIsSidebarOpen }: HeaderProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userData, setUserData] = useState<string>("");

  const toggleSideBar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const fetchUser = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const response = await axios.get(`${apiUrl}/user_details/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUserData(response.data.name);
    } catch (error) {
      console.error("User fetch failed", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(DataNameModel.ACCESS_TOKEN);
    localStorage.removeItem(DataNameModel.REFRESH_TOKEN);
    sessionStorage.removeItem(DataNameModel.ACCESS_TOKEN);
    sessionStorage.removeItem(DataNameModel.REFRESH_TOKEN);
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
        {isSidebarOpen && (
          <div className="side-bar">
            <SideBar setIsOpen={toggleSideBar} isOpen={isSidebarOpen} />
          </div>
        )}
      </div>

      <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}>
        <Settings
          onClose={() => setIsSettingsOpen(false)}
          onUpdated={fetchUser}
        />
      </Modal>
    </>
  );
};
