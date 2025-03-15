import { ChangeEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FormSetUp } from "../../components";
import { Image, Input, Button } from "../../components";

import SZE from "./../../assets/SZE.png";
import Show from "./../../assets/show-password.svg";
import Hide from "./../../assets/hide-password.svg";

import "./registration.css";

export const SignIn: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const generateToken = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const users = JSON.parse(localStorage.getItem("users") || "[]");

    const user = users.find(
      (user: { email: string; password: string }) =>
        user.email === email && user.password === password
    );

    if (!user) {
      setError("Hibás email vagy jelszó!");
      return;
    }

    const token = generateToken();
    localStorage.setItem("authToken", token);

    navigate("/MainPage");
  };

  const setEmailValue = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const setPasswordValue = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  return (
    <FormSetUp onSubmit={handleSubmit} hasModal={false} className="container">
      <Image src={SZE} />
      <div className="form-group">
        <Input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={setEmailValue}
          required
        />
      </div>

      <div className="form-group">
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={setPasswordValue}
          required
          srcShow={Show}
          srcHide={Hide}
        />
      </div>

      {error && <p className="error-message">{error}</p>}

      <Button type="submit" className="button">
        Bejelentkezés
      </Button>
      <Link to="/signup" className="nav">
        Még nincs profilja?
      </Link>
    </FormSetUp>
  );
};
