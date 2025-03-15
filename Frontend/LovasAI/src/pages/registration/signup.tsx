import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import { FormSetUp } from "../../components";
import { Image, Input, Button } from "../../components";

import SZE from "./../../assets/SZE.png";
import Show from "./../../assets/show-password.svg";
import Hide from "./../../assets/hide-password.svg";

import "./registration.css";

const schema = yup.object().shape({
  email: yup.string().email("Érvénytelen email!").required("Email kötelező!"),
  password: yup
    .string()
    .min(6, "A jelszónak legalább 6 karakter hosszúnak kell lennie!")
    .required("Jelszó kötelező!"),
});

type FormValues = {
  email: string;
  password: string;
};

export const SignUp: React.FC = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: FormValues) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    if (users.some((user: { email: string }) => user.email === data.email)) {
      alert("Ez az email már létezik!");
      return;
    }

    users.push(data);
    localStorage.setItem("users", JSON.stringify(users));

    navigate("/");
  };

  return (
    <FormSetUp
      onSubmit={handleSubmit(onSubmit)}
      hasModal={false}
      className="container"
    >
      <Image src={SZE} />

      <div className="form-group">
        <Input type="email" placeholder="Enter email" {...register("email")} />
        {errors.email && (
          <p className="error-message">{errors.email.message}</p>
        )}
      </div>

      <div className="form-group">
        <Input
          type="password"
          placeholder="Password"
          {...register("password")}
          srcShow={Show}
          srcHide={Hide}
        />
        {errors.password && (
          <p className="error-message">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="button">
        Regisztráció
      </Button>

      <Link to="/" className="nav">
        Van már profilja?
      </Link>
    </FormSetUp>
  );
};
