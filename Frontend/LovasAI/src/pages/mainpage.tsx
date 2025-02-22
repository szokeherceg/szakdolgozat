import { useLocation } from "react-router-dom";
import { Image, FormSetUp, SideBar } from "../components";

import "./pages.css";

import list from "./../assets/list.svg";
import { useState } from "react";

export const MainPage: React.FC = () => {
  const [showSideBar, setShowSideBar] = useState(false);
  const location = useLocation();
  const { email } = location.state || {};

  const consoleMessage = () => {
    setShowSideBar((prev) => !prev);
  };

  return (
    <div>
      <FormSetUp height="100vh" width="120vh">
        <div className="list-button" onClick={consoleMessage}>
          <Image src={list} height="40px" width="40px" />
        </div>
        <div>
          <h1>Üdvözöllek a főoldalon!</h1>
          <p>
            <strong>Email:</strong> {email || "Nincs megadva"}
          </p>
        </div>
      </FormSetUp>
      {showSideBar && (
        <div className="side-bar">
          <FormSetUp height="auto" width="auto">
            <SideBar />
          </FormSetUp>
        </div>
      )}
    </div>
  );
};
