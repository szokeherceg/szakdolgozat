import Button from "./button";
import Input from "./input";

import 'bootstrap/dist/css/bootstrap.min.css'; 
function Forms() {
  return (<div>
    <form className="card" id='card'>
      <Input type="email" id="email" name="email" className="form-control-plaintext" placeholder="Email" />    
      <Input type="password" id="password" name="password" className="form-control-plaintext" placeholder="Jelszó" />  
      <Button text="Gomb"/>
      </form>
    </div>)
}
export default Forms;