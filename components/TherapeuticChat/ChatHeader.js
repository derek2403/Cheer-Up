import styles from '../../styles/Chatbot.module.css';

const ChatHeader = () => {
  return (
    <div className={styles.chatHeader}>
      <h2>Your Therapeutic Space</h2>
      <div className={styles.statusIndicator}></div>
    </div>
  );
};

export default ChatHeader; 