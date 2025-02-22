import { useLocation } from "react-router-dom";
import { Button, Image, FormSetUp } from "../components";

import "./pages.css";

import list from "./../assets/list.svg";

export const MainPage: React.FC = () => {
  const location = useLocation();
  const { email } = location.state || {};

  return (
    <div>
      <FormSetUp height="100vh" width="100vh">
        <Button className="list-button">
          <Image src={list} height="40px" width="40px" />
        </Button>
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
