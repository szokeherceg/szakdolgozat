import { Link, useNavigate } from "react-router-dom";
import { Image } from "../image/image";

import Profilesvg from "./../../assets/profile.svg";
import HomePagesvg from "./../../assets/homepage.svg";
import WhiteHorse from "./../../assets/whitehorse.svg";
import X from "./../../assets/whitex.svg";

import "./side-bar.css";
import { Dropdown } from "../dropdown/dropdown";

interface SideBarProps {
  setIsOpen: (isOpen: boolean) => void;
}

export const SideBar = ({ setIsOpen }: SideBarProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    navigate("/");
  };

  return (
    <div className="side-bar">
      <div className="menu-container">
        <strong className="menu">Menü</strong>
        <Image
          src={X}
          height="30px"
          width="30px"
          className="menu-icon"
          onClick={() => setIsOpen(false)}
        />
      </div>

      <ul className="w-full space-y-4">
        <li>
          <Link to="/mainpage" className="sidebar-link">
            <Image height="24px" width="24px" src={HomePagesvg} />
            <span>Főoldal</span>
          </Link>
        </li>
        <li>
          <Dropdown
            buttonLabel={
              <span className="sidebar-link">
                <Image height="24px" width="24px" src={Profilesvg} />
                Profil
              </span>
            }
            items={[
              {
                label: "Beállítások",
                onClick: () => navigate("/Settings"),
              },
              {
                label: "Lovaim",
                onClick: () => navigate("/HorsesList"),
              },
              {
                label: "Kijelentkezés",
                className: "logout",
                onClick: handleLogout,
              },
            ]}
          />
        </li>

        <li>
          <Link to="/AI" className="sidebar-link">
            <Image height="24px" width="24px" src={WhiteHorse} />
            <span>AI</span>
          </Link>
        </li>
      </ul>
    </div>
  );
};
