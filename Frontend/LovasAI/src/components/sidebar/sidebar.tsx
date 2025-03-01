import { Link } from "react-router-dom";
import { Image } from "../image/image";
import Profilsvg from "../../assets/profile.svg";
import HomePagesvg from "../../assets/homepage.svg";
import WhiteHorse from "../../assets/whitehorse.svg";

import "./side-bar.css";

export const SideBar = () => {
  return (
    <div>
      <strong>
        <div className="menu">Menü</div>
      </strong>
      <ul className="w-full space-y-4">
        <li>
          <Link to="/mainpage" className="sidebar-link">
            <Image height="24px" width="24px" src={HomePagesvg} />
            <span>Főoldal</span>
          </Link>
        </li>
        <li>
          <Link to="/profile" className="sidebar-link">
            <Image height="24px" width="24px" src={Profilsvg} />
            <span>Profil</span>
          </Link>
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
