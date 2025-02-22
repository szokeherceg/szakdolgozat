import { Link } from "react-router-dom";
import "./side-bar.css";

export const SideBar = () => {
  return (
    <div className="side-bar">
      <div className="h-full px-4 py-8">
        <ul>
          <li>
            <Link to="/" className="block py-2 px-4 hover:bg-gray-700 rounded">
              Főoldal
            </Link>
          </li>
          <li>
            <Link
              to="/profil"
              className="block py-2 px-4 hover:bg-gray-700 rounded"
            >
              Profil
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};
