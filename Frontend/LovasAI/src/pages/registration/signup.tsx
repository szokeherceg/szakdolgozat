import { ChangeEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormSetUp } from "../../components";
import { Image, Input, Button } from "../../components";

export const SignUp: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const setEmailValue = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const setPasswordValue = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    navigate("/", { state: { email, password } });
  };

  return (
    <div>
      <FormSetUp height="60vh" width="50vh" onSubmit={handleSubmit}>
        <Image />

        <div className="form-group">
          <Input
            type="email"
            className="form-control"
            id="exampleInputEmail1"
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
            id="exampleInputPassword1"
            placeholder="Password"
            value={password}
            onChange={setPasswordValue}
            required
          />
        </div>

        <Button type="submit" className="btn btn-primary">
          Regisztráció
        </Button>
      </FormSetUp>
    </div>
  );
};
