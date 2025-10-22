import React, { useState, useEffect, useContext } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/Lyria/historico');
        const history = response.data.historico.map((item, index) => ({
          _id: index,
          text: item.mensagem,
          createdAt: new Date(item.timestamp),
          user: {
            _id: item.autor === 'usuario' ? 1 : 2,
            name: item.autor,
          },
        })).reverse();
        setMessages(history);
      } catch (error) {
        console.error('Erro ao buscar histórico:', error);
      }
    };

    fetchHistory();
  }, []);

  const onSend = async (newMessages = []) => {
    const userMessage = newMessages[0];
    setMessages(previousMessages => GiftedChat.append(previousMessages, userMessage));

    try {
      const response = await api.post('/Lyria/conversar-logado', {
        pergunta: userMessage.text,
      });

      const botMessage = {
        _id: Math.random().toString(36).substring(7),
        text: response.data.resposta,
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'Lyria',
        },
      };

      setMessages(previousMessages => GiftedChat.append(previousMessages, botMessage));
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  return (
    <GiftedChat
      messages={messages}
      onSend={messages => onSend(messages)}
      user={{
        _id: 1,
        name: user.nome,
      }}
    />
  );
};

export default ChatScreen;
