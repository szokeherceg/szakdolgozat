import { ReactEventHandler, ReactNode, useState } from "react";
import classNames from "classnames";
import "./form.css";
import { SideBar } from "../sidebar/sidebar";
import list from "./../../assets/list.svg";

interface FormSetUpProps {
  children: ReactNode;
  onSubmit?: ReactEventHandler<HTMLElement>;
  hasModal?: boolean;
  className?: string;
}

export const FormSetUp: React.FC<FormSetUpProps> = ({
  children,
  onSubmit,
  hasModal,
  className = "",
}) => {
  const [showSideBar, setShowSideBar] = useState(true);

  const SideBarFunction = () => {
    setShowSideBar((prev) => !prev);
  };

  const Modal = () => (
    <div>
      <div className="list-button" onClick={SideBarFunction}>
        <img src={list} height="40px" width="40px" alt="Toggle Sidebar" />
      </div>
      {showSideBar && (
        <div className="side-bar">
          <SideBar setIsOpen={SideBarFunction} />
        </div>
      )}
    </div>
  );

  return (
    <>
      <form
        onSubmit={onSubmit}
        data-has-modal={hasModal}
        className={classNames(className)} // Dinamikus osztályok
      >
        {children}
      </form>
      {hasModal && <Modal />}
    </>
  );
};
