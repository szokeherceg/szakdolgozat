import { useState } from "react";
import classNames from "classnames";
import { Header } from "../header/header";
import { FormSetUp } from "../../ui/form/form";
import { PageLayoutProps } from "../../../models";
import { isDesktopLayout } from "../../../utils/layout";
import Load from "./../../../assets/load.svg";

export const PageLayout = ({
  className,
  onSubmit,
  isLoading = false,
  children,
}: PageLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(isDesktopLayout);

  return (
    <>
      <Header
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {isLoading ? (
        <div className="loader-container">
          <img src={Load} alt="Loading..." className="loading-image" />
        </div>
      ) : (
        <FormSetUp onSubmit={onSubmit} className={classNames("page", className)}>
          {children}
        </FormSetUp>
      )}
    </>
  );
};
