import { Image, FormSetUp, SideBar } from "../components";

import "./pages.css";

import list from "./../assets/list.svg";
import { useState } from "react";

export const MainPage = () => {
  const [showSideBar, setShowSideBar] = useState(false);

  const SideBarFunction = () => {
    setShowSideBar((prev) => !prev);
    console.log(showSideBar);
  };

  return (
    <div>
      <FormSetUp height="80vh" width="120vh">
        <div className="list-button" onClick={SideBarFunction}>
          <Image src={list} height="40px" width="40px" />
        </div>
      </FormSetUp>
      {showSideBar && (
        <div className="side-bar">
          <SideBar />
        </div>
      )}
    </div>
  );
};
