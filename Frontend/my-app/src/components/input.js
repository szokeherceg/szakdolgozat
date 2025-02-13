function Input({ type, ...maradek }) {
    return (
        <input 
            type={type}
            {...maradek}
        />
    );  
} 

export default Input;
