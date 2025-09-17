import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { listConversas, deletarConversa } from '../services/LyriaApi';
import { Ionicons } from '@expo/vector-icons';

const DrawerContent = () => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const { user } = useAuth();
  const isFocused = useIsFocused(); // This hook tells us if the drawer is focused (i.e., open)

  const fetchConversations = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      try {
        const response = await listConversas(user.nome);
        if (response.conversas) {
          setConversations(response.conversas);
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
        Alert.alert("Erro", "Não foi possível carregar o histórico de conversas.");
      } finally {
        setIsLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    if (isFocused) {
      fetchConversations();
    }
  }, [isFocused, fetchConversations]);

  const handleSelectConversation = (conversationId) => {
    navigation.closeDrawer();
    navigation.navigate('Chat', { conversationId: conversationId });
  };

  const handleNewChat = () => {
    navigation.closeDrawer();
    navigation.navigate('Chat', { conversationId: null, timestamp: Date.now() }); // Add timestamp to force re-render
  };

  const handleDeleteConversation = async (conversationId) => {
    Alert.alert(
      "Deletar Conversa",
      "Você tem certeza que quer deletar esta conversa? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Deletar",
          style: "destructive",
          onPress: async () => {
            try {
              await deletarConversa(conversationId);
              // Refresh the list
              fetchConversations();
            } catch (error) {
              Alert.alert("Erro", "Não foi possível deletar a conversa.");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.conversationItem} onPress={() => handleSelectConversation(item.id)}>
        <Text style={styles.conversationText} numberOfLines={1}>{item.titulo}</Text>
        <TouchableOpacity onPress={() => handleDeleteConversation(item.id)} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={20} color="#c9b6f2" />
        </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.title}>Histórico</Text>
        </View>
        <TouchableOpacity style={styles.newChatButton} onPress={handleNewChat}>
            <Ionicons name="add" size={24} color="#f0f0f0" />
            <Text style={styles.newChatText}>Novo Chat</Text>
        </TouchableOpacity>

        {isLoading ? (
            <ActivityIndicator size="large" color="#c9b6f2" style={{ marginTop: 20 }}/>
        ) : (
            <FlatList
                data={conversations}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                style={{ marginTop: 20 }}
                ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma conversa encontrada.</Text>}
            />
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A051E',
    paddingTop: 50, // For status bar
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f0f0f0',
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(193, 182, 242, 0.2)',
    marginHorizontal: 15,
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
  },
  newChatText: {
    color: '#f0f0f0',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  conversationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  conversationText: {
    color: '#d1d1d1',
    fontSize: 16,
    flex: 1,
  },
  deleteButton: {
    padding: 5,
  },
  emptyText: {
    color: '#8e8e93',
    textAlign: 'center',
    marginTop: 30,
  }
});

export default DrawerContent;
