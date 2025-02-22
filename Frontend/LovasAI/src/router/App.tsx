import { Route, Routes } from "react-router-dom";

import { SignIn } from "../pages/registration/signin";
import { SignUp } from "../pages/registration/signup";
import { MainPage } from "../pages/mainpage";

import "./App.css";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/MainPage" element={<MainPage />} />
      </Routes>
    </>
  );
}

export default App;
