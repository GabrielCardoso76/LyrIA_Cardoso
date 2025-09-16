import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { conversar } from '../services/LyriaApi';

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const flatListRef = useRef();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const handleSend = async () => {
    if (input.trim() && !isBotTyping) {
      const userMessage = { id: Date.now().toString(), text: input, sender: 'user' };
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setInput('');
      setIsBotTyping(true);

      try {
        // We are passing an empty history for now. This will be updated in a later step.
        const response = await conversar(input, []);
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
        <Text style={styles.senderName}>{item.sender === 'bot' ? 'LyrIA' : user?.nome || 'Você'}</Text>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={insets.top + insets.bottom}
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
             <View style={[styles.avatar, styles.botAvatar]} />
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
});

export default ChatScreen;
