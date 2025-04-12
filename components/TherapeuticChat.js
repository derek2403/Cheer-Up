import { useRef } from 'react';
import styles from '../styles/Chatbot.module.css';
import ChatHeader from './TherapeuticChat/ChatHeader';
import MessageList from './TherapeuticChat/MessageList';
import ChatInput from './TherapeuticChat/ChatInput';
import ContextSection from './TherapeuticChat/ContextSection';
import useGradientBackground from './TherapeuticChat/hooks/useGradientBackground';
import useChatMessages from './TherapeuticChat/hooks/useChatMessages';
import useFileUpload from './TherapeuticChat/hooks/useFileUpload';

const TherapeuticChat = () => {
  const { gradientAngle, gradientColors } = useGradientBackground();
  const { 
    messages, 
    setMessages,
    loading, 
    handleSubmitMessage,
    messagesEndRef
  } = useChatMessages();
  
  const {
    files,
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInputChange,
    removeFile,
    fileInputRef,
    isProcessing
  } = useFileUpload({ setMessages });

  return (
    <div className={styles.chatbotWrapperLarge}>
      <ContextSection 
        isDragging={isDragging}
        handleDragOver={handleDragOver}
        handleDragLeave={handleDragLeave}
        handleDrop={handleDrop}
        fileInputRef={fileInputRef}
        handleFileInputChange={handleFileInputChange}
        files={files}
        removeFile={removeFile}
        isProcessing={isProcessing}
      />

      <div 
        className={styles.chatbotContainer}
        style={{
          background: `linear-gradient(${gradientAngle}deg, ${gradientColors.color1}, ${gradientColors.color2})`
        }}
      >
        <ChatHeader />
        <MessageList messages={messages} messagesEndRef={messagesEndRef} />
        <ChatInput 
          loading={loading} 
          onSubmit={handleSubmitMessage} 
        />
      </div>
    </div>
  );
};

export default TherapeuticChat; 