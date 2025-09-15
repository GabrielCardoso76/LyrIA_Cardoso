import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { conversarAnonimo } from '../services/LyriaApi';

const dummyConversations = [
  { id: '1', titulo: 'Ideias de Projeto em React' },
  { id: '2', titulo: 'Melhor turma do SENAI' },
  { id: '3', titulo: 'Como você funciona?' },
  { id: '4', titulo: 'Receita de bolo de chocolate' },
];

const HistoryPanel = ({ isVisible, onClose, conversations }) => {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.historyOverlay}>
        <View style={[styles.historyPanel, { paddingTop: insets.top }]}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Histórico</Text>
            <TouchableOpacity onPress={onClose} style={styles.headerIcon}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.historyItem}>
                <Text style={styles.historyItemText}>{item.titulo}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

const Header = ({ onHistoryPress }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onHistoryPress} style={styles.headerIcon}>
      <Text style={styles.historyIcon}>☰</Text>
    </TouchableOpacity>
    <Text style={styles.headerTitle}>LyrIA</Text>
    <View style={{ width: 40 }} />
  </View>
);

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isHistoryVisible, setHistoryVisible] = useState(false);
  const flatListRef = useRef();
  const insets = useSafeAreaInsets();

  const handleSend = async () => {
    if (input.trim() && !isBotTyping) {
      const userMessage = { id: Date.now().toString(), text: input, sender: 'user' };
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setInput('');
      setIsBotTyping(true);

      try {
        const response = await conversarAnonimo(input);
        const botMessage = { id: Date.now().toString(), text: response.resposta, sender: 'bot' };
        setMessages(prevMessages => [...prevMessages, botMessage]);
      } catch (error) {
        const errorMessage = { id: Date.now().toString(), text: 'Sorry, something went wrong.', sender: 'bot' };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      } finally {
        setIsBotTyping(false);
      }
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.messageWrapper, item.sender === 'user' ? styles.userMessageWrapper : styles.botMessageWrapper]}>
      <View style={[styles.avatar, item.sender === 'user' ? styles.userAvatar : styles.botAvatar]} />
      <View style={[styles.messageContainer, item.sender === 'user' ? styles.userMessageContainer : styles.botMessageContainer]}>
        <Text style={styles.senderName}>{item.sender === 'bot' ? 'LyrIA' : 'Você'}</Text>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" />
      <HistoryPanel
        isVisible={isHistoryVisible}
        onClose={() => setHistoryVisible(false)}
        conversations={dummyConversations}
      />
      <Header onHistoryPress={() => setHistoryVisible(true)} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current.scrollToEnd({ animated: true })}
        />
        {isBotTyping && (
          <View style={styles.typingIndicatorContainer}>
             <View style={styles.avatar} />
            <Text style={styles.typingText}>LyrIA is typing...</Text>
          </View>
        )}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Digite sua mensagem para LyrIA..."
            placeholderTextColor="#8e8e93"
            editable={!isBotTyping}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={!input.trim() || isBotTyping}>
            <Text style={styles.sendButtonText}>➔</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A051E',
  },
  header: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#f0f0f0',
    fontSize: 20,
    fontWeight: '500',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  headerIcon: {
    padding: 5,
  },
  historyIcon: {
    color: '#c9b6f2',
    fontSize: 28,
  },
  closeIcon: {
    color: '#c9b6f2',
    fontSize: 24,
  },
  messagesList: {
    padding: 15,
  },
  messageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 15,
    maxWidth: '80%',
  },
  botMessageWrapper: {
    alignSelf: 'flex-start',
  },
  userMessageWrapper: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  botAvatar: {
    backgroundColor: '#442f73',
  },
  userAvatar: {
    backgroundColor: '#6344a6',
  },
  messageContainer: {
    padding: 12,
  },
  botMessageContainer: {
    backgroundColor: '#442f73',
    borderRadius: 20,
    borderBottomLeftRadius: 5,
  },
  userMessageContainer: {
    backgroundColor: '#6344a6',
    borderRadius: 20,
    borderBottomRightRadius: 5,
  },
  senderName: {
    color: '#c9b6f2',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  messageText: {
    color: '#f0f0f0',
    fontSize: 16,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 15,
    marginBottom: 10,
    backgroundColor: 'rgba(10, 5, 30, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
  },
  input: {
    flex: 1,
    color: '#f0f0f0',
    fontSize: 16,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 120,
  },
  sendButton: {
    backgroundColor: '#6344a6',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  sendButtonText: {
    color: '#f0f0f0',
    fontSize: 24,
    transform: [{ rotate: '-45deg' }]
  },
  typingIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingBottom: 0,
  },
  typingText: {
    marginLeft: 10,
    color: '#c9b6f2',
    fontSize: 14,
  },
  // History Panel Styles
  historyOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  historyPanel: {
    width: '85%',
    height: '100%',
    backgroundColor: '#130f2f',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
  },
  historyHeader: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  historyTitle: {
    color: '#f0f0f0',
    fontSize: 20,
    fontWeight: 'bold',
  },
  historyItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  historyItemText: {
    color: '#f0f0f0',
    fontSize: 16,
  },
});

export default ChatScreen;
