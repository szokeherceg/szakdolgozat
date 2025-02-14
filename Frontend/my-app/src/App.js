import './App.css';
import { Routes, Route } from "react-router-dom";
import LogIn from './components/login';
import SigUp from './components/signup';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LogIn />} /> 
      <Route path="/signup" element={<SigUp />} /> 
    </Routes>
  );
}

export default App;
