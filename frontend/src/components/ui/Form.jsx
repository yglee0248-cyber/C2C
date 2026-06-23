import styles from "./Form.module.css";

const Input = (props) => {
  return <input className={styles.input} {...props} />;
};

const TextArea = (props) => {
  return <textarea className={styles.textarea} {...props} />;
};

export { Input, TextArea };
