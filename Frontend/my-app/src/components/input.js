function Input({ type, ...rest }) {
    return (
        <input 
            type={type}
            {...rest}
        />
    );  
} 

export default Input;
