import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { SideBar } from "../sidebar/sidebar";
import list from "./../../assets/list.svg";
import { Dropdown } from "../dropdown/dropdown";
import { Modal } from "../../pages/modal/modal";
import { Settings } from "../../pages";
import "./header.css";

export const Header = () => {
  const [showSideBar, setShowSideBar] = useState(true);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const toggleSideBar = () => {
    setShowSideBar((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    navigate("/");
  };

  return (
    <>
      <div className="header">
        <div className="list-button" onClick={toggleSideBar}>
          <img src={list} height="40px" width="40px" alt="Toggle Sidebar" />
        </div>
        <div className="profile">
          <Dropdown
            buttonLabel={<span className="sidebar-link">{t("profile")}</span>}
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
