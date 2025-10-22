import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import * as Crypto from 'expo-crypto';
import api from '../services/api';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }
    const hashedPassword = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password
    );
    const result = await login(email, hashedPassword);
    if (!result.success) {
      Alert.alert('Erro de Login', result.error);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !nome) {
        Alert.alert('Erro', 'Por favor, preencha todos os campos.');
        return;
    }
    const hashedPassword = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password
    );
    try {
        await api.post('/Lyria/usuarios', { nome, email, senha_hash: hashedPassword, persona: 'social' });
        Alert.alert('Sucesso', 'Usuário registrado com sucesso! Por favor, faça o login.');
        setIsRegistering(false);
    } catch (error) {
        Alert.alert('Erro de Registro', 'Não foi possível registrar o usuário.');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, textAlign: 'center', marginBottom: 20 }}>
        {isRegistering ? 'Registro' : 'Login'}
      </Text>
      {isRegistering && (
        <TextInput
          placeholder="Nome"
          value={nome}
          onChangeText={setNome}
          style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        />
      )}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <TextInput
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
      />
      {isRegistering ? (
        <>
          <Button title="Registrar" onPress={handleRegister} />
          <Button title="Voltar para o Login" onPress={() => setIsRegistering(false)} />
        </>
      ) : (
        <>
          <Button title="Login" onPress={handleLogin} />
          <Button title="Não tem uma conta? Registre-se" onPress={() => setIsRegistering(true)} />
        </>
      )}
    </View>
  );
};

export default LoginScreen;
