import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const RegistrationScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await register(name, email, password);
       if (!response.sucesso) {
        Alert.alert('Erro no Cadastro', response.erro || 'Não foi possível fazer o cadastro.');
      }
    } catch (error) {
       Alert.alert('Erro no Cadastro', error.erro || 'Ocorreu um erro inesperado.');
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <Text style={styles.title}>Crie sua Conta</Text>
        <Text style={styles.subtitle}>É rápido e fácil</Text>

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Nome Completo"
          placeholderTextColor="#8e8e93"
          editable={!isLoading}
        />
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#8e8e93"
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
            placeholder="Senha"
            placeholderTextColor="#8e8e93"
            secureTextEntry={!isPasswordVisible}
            editable={!isLoading}
          />
          <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
            <Ionicons name={isPasswordVisible ? 'eye-off' : 'eye'} size={24} color="#8e8e93" />
          </TouchableOpacity>
        </View>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirmar Senha"
            placeholderTextColor="#8e8e93"
            secureTextEntry={!isConfirmPasswordVisible}
            editable={!isLoading}
          />
          <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} style={styles.eyeIcon}>
            <Ionicons name={isConfirmPasswordVisible ? 'eye-off' : 'eye'} size={24} color="#8e8e93" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={isLoading}>
          <Text style={styles.buttonText}>{isLoading ? 'Cadastrando...' : 'Cadastrar'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Login')} disabled={isLoading}>
          <Text style={styles.linkText}>Já tem uma conta? Faça login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A051E',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 30,
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
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#f0f0f0',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  passwordInput: {
    flex: 1,
    color: '#f0f0f0',
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 15,
  },
  button: {
    backgroundColor: '#6344a6',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#f0f0f0',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 30,
    alignItems: 'center',
  },
  linkText: {
    color: '#c9b6f2',
    fontSize: 16,
  },
});

export default RegistrationScreen;
