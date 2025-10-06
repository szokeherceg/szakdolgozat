import { useState } from "react";
import { FormSetUp, Header } from "../components";

export const HorseDetail = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  return (
    <>
      <Header
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <FormSetUp className={isSidebarOpen ? "form-shifted" : "form-centered"}>
        <h1>New Page</h1>
      </FormSetUp>
    </>
  );
};
