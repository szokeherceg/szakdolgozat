import { Route, Routes } from "react-router-dom";
import {
  AddHorse,
  AddMeasurement,
  AI,
  SignIn,
  SignUp,
  ResetPassword,
  MainPage,
  HorsesList,
  Settings,
  EditHorse,
  EditMeasurement,
  HorseDetail,
} from "../pages";
import { ProtectedRoute } from "./protected-route";

import "./App.css";

function App() {
  return (
    <>
      <Routes>
        <Route path="/SignIn" element={<SignIn />} />
        <Route path="/" element={<SignUp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/MainPage" element={<MainPage />} />
          <Route path="/HorsesList" element={<HorsesList />} />
          <Route path="/AI/:id" element={<AI />} />
          <Route path="/Settings" element={<Settings onClose={() => {}} />} />
          <Route
            path="/ForgotPassword"
            element={<Settings onClose={() => {}} />}
          />
          <Route path="/AddHorse" element={<AddHorse />} />
          <Route path="/AddMeasurement/:id" element={<AddMeasurement />} />
          <Route path="/EditHorse/:id" element={<EditHorse />} />
          <Route path="/EditMeasurement/:id" element={<EditMeasurement />} />
          <Route path="/HorseDetail/:id" element={<HorseDetail />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
