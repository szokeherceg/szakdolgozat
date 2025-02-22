import { useLocation } from "react-router-dom";
import { Button, Image, FormSetUp } from "../components";

import "./pages.css";

import list from "./../assets/list.svg";

export const MainPage: React.FC = () => {
  const location = useLocation();
  const { email } = location.state || {};

  const consoleMessage = () => {
    console.log("Bejelentkezett email:", email || "Nincs megadva");
  };

  return (
    <div>
      <FormSetUp height="100vh" width="100vh">
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
    </div>
  );
};
