import Input from "./input";
function Forms() {
  return (<div>
    <form>
      <Input type="email" id="email" name="email" className="form-control-plaintext" placeholder="Email" />    
      <Input type="password" id="password" name="password" className="form-control-plaintext" placeholder="Jelszó" />      
      </form>
    </div>)
}
export default Forms;