import { Route, Routes } from "react-router-dom";

import { SignIn, SignUp, MainPage, Profile } from "../pages";

import "./App.css";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/MainPage" element={<MainPage />} />
        <Route path="/Profile" element={<Profile />} />
      </Routes>
    </>
  );
}

export default App;
