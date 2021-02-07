import "./styles.css";

const Input = ({ value, type, title, onChangeHandler, disabled }) => {
  if (type === "file")
    return (
      <input
        className="custom-file-input"
        onChange={onChangeHandler}
        type="file"
        disabled={disabled}
      />
    );
  else if (type === "text")
    return <input onChange={onChangeHandler} value={value} type="text" />;
};

export default Input;
