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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { conversar, getConversa } from '../services/LyriaApi';
import { useRoute, useIsFocused, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import MarkdownRenderer from '../components/MarkdownRenderer';
import TypingIndicator from '../components/TypingIndicator';

const ChatHeader = ({ onNewChat, onToggleVoice, onHistory }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onHistory} style={styles.headerButton}>
      <Ionicons name="time-outline" size={24} color="#c9b6f2" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>LyrIA</Text>
    <View style={styles.headerRight}>
        <TouchableOpacity onPress={onNewChat} style={styles.headerButton}>
            <Ionicons name="add" size={28} color="#c9b6f2" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onToggleVoice} style={styles.headerButton}>
            <Ionicons name="mic-off-outline" size={24} color="#c9b6f2" />
        </TouchableOpacity>
    </View>
  </View>
);


const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const flatListRef = useRef();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const route = useRoute();
  const isFocused = useIsFocused();
  const navigation = useNavigation();


  useEffect(() => {
    const conversationId = route.params?.conversationId;
    if (conversationId) {
      setCurrentConversationId(conversationId);
      loadConversation(conversationId);
    } else {
        handleNewChat();
    }
  }, [route.params?.conversationId]);

  const handleNewChat = () => {
    setMessages([]);
    setCurrentConversationId(null);
    // This is to clear the conversationId from the route params
    // so that if we navigate back to this screen it starts a new chat.
    navigation.setParams({ conversationId: undefined });
  }

  const loadConversation = async (conversationId) => {
    try {
      setIsLoading(true);
      const response = await getConversa(conversationId);
      if (response.mensagens) {
        const formattedMessages = response.mensagens.map(msg => ({
          id: msg.id.toString(),
          text: msg.conteudo,
          sender: msg.remetente === 'usuario' ? 'user' : 'bot',
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error("Failed to load conversation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (input.trim() && !isBotTyping && user) {
      const userMessage = { id: Date.now().toString(), text: input, sender: 'user' };
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setInput('');
      setIsBotTyping(true);

      try {
        const history = messages.map(msg => msg.text);
        const response = await conversar(user.nome, input, history, currentConversationId);

        if (response.new_conversa_id) {
            setCurrentConversationId(response.new_conversa_id);
        }

        const botMessage = { id: Date.now().toString(), text: response.resposta, sender: 'bot' };
        setMessages(prevMessages => [...prevMessages, botMessage]);
      } catch (error) {
        const errorMessage = { id: Date.now().toString(), text: error.erro || 'Sorry, something went wrong.', sender: 'bot' };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      } finally {
        setIsBotTyping(false);
      }
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.messageWrapper, item.sender === 'user' ? styles.userMessageWrapper : styles.botMessageWrapper]}>
        {item.sender === 'user' && user?.foto_perfil_url ? (
            <Image source={{ uri: `http://172.20.10.12:5001${user.foto_perfil_url}` }} style={styles.avatar} />
        ) : (
            <View style={[styles.avatar, item.sender === 'user' ? styles.userAvatar : styles.botAvatar]} />
        )}
      <View style={[styles.messageContainer, item.sender === 'user' ? styles.userMessageContainer : styles.botMessageContainer]}>
        <Text style={styles.senderName}>{item.sender === 'bot' ? 'LyrIA' : user?.nome || 'Você'}</Text>
        <MarkdownRenderer content={item.text} />
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#c9b6f2" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" />
      <ChatHeader
        onNewChat={handleNewChat}
        onToggleVoice={() => Alert.alert('Funcionalidade em desenvolvimento', 'A funcionalidade de voz ainda não foi implementada.')}
        onHistory={() => navigation.navigate('History')}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current.scrollToEnd({ animated: true })}
          ListFooterComponent={isBotTyping ? (
            <View style={styles.typingIndicatorContainer}>
               <View style={[styles.avatar, styles.botAvatar]} />
               <TypingIndicator />
            </View>
          ) : null}
        />
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  headerRight: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 5,
    marginLeft: 10,
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
    alignSelf: 'flex-start', // Align to the left like bot messages
    marginBottom: 15, // Match message wrapper spacing
    paddingHorizontal: 15, // Match messagesList padding
  },
  typingText: {
    marginLeft: 10,
    color: '#c9b6f2',
    fontSize: 14,
  },
});

export default ChatScreen;
