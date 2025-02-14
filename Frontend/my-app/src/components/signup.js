import Button from "./button";
import Input from "./input";

import 'bootstrap/dist/css/bootstrap.min.css'; 

function SignUp() {
  return (<div>
    <form className="card" id='card'>
      <Input type="email" id="email" name="email" className="form-control-plaintext" placeholder="Email" />    
      <Input type="password" id="password" name="password" className="form-control-plaintext" placeholder="Jelszó" />  
      <Button text="Regisztráció"/>
      </form>
    </div>)
}
export default SignUp;