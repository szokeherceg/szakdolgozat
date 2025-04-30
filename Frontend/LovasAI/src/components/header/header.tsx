import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { SideBar } from "../sidebar/sidebar";
import list from "./../../assets/list.svg";
import { Dropdown } from "../dropdown/dropdown";
import { Modal } from "../../pages/modal/modal";
import { Settings } from "../../pages";
import Profilesvg from "./../../assets/profile.svg";
import "./header.css";
import axios from "axios";

export const Header = () => {
  const [showSideBar, setShowSideBar] = useState(true);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userData, setUserData] = useState<string>("");

  const toggleSideBar = () => {
    setShowSideBar((prev) => !prev);
  };

  useEffect(() => {
    useMemo;
    const fetchUser = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        const response = await axios.get(
          "http://127.0.0.1:8080/user/user_details/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setUserData(response.data.name);
      } catch (error) {
        console.error("User fetch failed", error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
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
                label: t("settings"),
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
        {showSideBar && (
          <div className="side-bar">
            <SideBar setIsOpen={toggleSideBar} />
          </div>
        )}
      </div>

      <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}>
        <Settings onClose={() => setIsSettingsOpen(false)} />
      </Modal>
    </>
  );
};
