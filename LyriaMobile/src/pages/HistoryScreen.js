import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { getHistorico } from '../services/LyriaApi';
import { useNavigation, useIsFocused } from '@react-navigation/native';

const HistoryScreen = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async () => {
    if (user) {
      try {
        setIsLoading(true);
        const response = await getHistorico(user.nome);
        if (response.historico) {
          setConversations(response.historico);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchHistory();
    }
  }, [isFocused, user]);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.historyItem} onPress={() => navigation.navigate('Chat', { conversationId: item.id })}>
      <Text style={styles.historyItemText}>{item.titulo}</Text>
      <Text style={styles.historyItemDate}>{new Date(item.data_criacao).toLocaleDateString()}</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#c9b6f2" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>Histórico de Conversas</Text>
      {conversations.length > 0 ? (
        <FlatList
          data={conversations}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.centerContent}>
            <Text style={styles.emptyText}>Nenhuma conversa encontrada.</Text>
        </View>
      )}
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
  title: {
    color: '#f0f0f0',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  list: {
    paddingHorizontal: 20,
  },
  historyItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
  },
  historyItemText: {
    color: '#f0f0f0',
    fontSize: 18,
    fontWeight: 'bold',
  },
  historyItemDate: {
    color: '#c9b6f2',
    fontSize: 14,
    marginTop: 5,
  },
  emptyText: {
    color: '#c9b6f2',
    fontSize: 18,
  },
});

export default HistoryScreen;
