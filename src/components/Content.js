import styles from "./Content.module.css";

const Content = (props) => {
    return (
      <div className={styles.content} style={props.style}>
        {props.children}
      </div>
    );
  };
  
  export default Content;