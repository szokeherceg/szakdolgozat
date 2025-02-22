import { FormSetUp } from "../components";
import { Image, Input, Button } from "../components";

export const SignUp: React.FC = () => {
  return (
    <div>
      <FormSetUp height="60vh" width="50vh">
        <Image />
        <div className="form-group">
          <Input
            type="email"
            className="form-control"
            id="exampleInputEmail1"
            placeholder="Enter email"
            required
          />
        </div>

        <div className="form-group">
          <Input
            type="password"
            className="form-control"
            id="exampleInputPassword1"
            placeholder="Password"
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
