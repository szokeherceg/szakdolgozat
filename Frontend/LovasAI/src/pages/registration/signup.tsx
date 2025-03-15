import { ChangeEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FormSetUp } from "../../components";
import { Image, Input, Button } from "../../components";

import SZE from "./../../assets/SZE.png";
import Show from "./../../assets/show-password.svg";
import Hide from "./../../assets/hide-password.svg";

import "./registration.css";

export const SignUp: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const users = JSON.parse(localStorage.getItem("users") || "[]");

    if (users.some((user: { email: string }) => user.email === email)) {
      setError("Ez az email már létezik!");
      return;
    }

    const newUser = { email, password };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    navigate("/");
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
          className="form-control"
          placeholder="Enter email"
          value={email}
          onChange={setEmailValue}
          required
        />
      </div>

      <div className="form-group">
        <Input
          type="password"
          className="form-control"
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
        Regisztráció
      </Button>
      <Link to="/" className="nav">
        Van már profilja?
      </Link>
    </FormSetUp>
  );
};
