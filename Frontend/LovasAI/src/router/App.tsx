import { Route, Routes } from "react-router-dom";
import {
  AddHorse,
  AI,
  SignIn,
  SignUp,
  MainPage,
  HorsesList,
  Settings,
} from "../pages";
import { ProtectedRoute } from "./protected-route";

import "./App.css";

function App() {
  return (
    <>
      <Routes>
        <Route path="/SignIn" element={<SignIn />} />
        <Route path="/" element={<SignUp />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/MainPage" element={<MainPage />} />
          <Route path="/HorsesList" element={<HorsesList />} />
          <Route path="/AI" element={<AI />} />
          <Route path="/Settings" element={<Settings onClose={() => {}} />} />
          <Route path="/AddHorse" element={<AddHorse />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
