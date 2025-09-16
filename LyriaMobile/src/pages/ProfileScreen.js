import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <Text style={styles.title}>Perfil</Text>
        {user && <Text style={styles.subtitle}>Olá, {user.nome}!</Text>}

        <TouchableOpacity style={styles.button} onPress={logout}>
          <Text style={styles.buttonText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A051E',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#f0f0f0',
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: '#c9b6f2',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#6344a6',
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#f0f0f0',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
