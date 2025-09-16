import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, registerUser } from '../services/LyriaApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setIsLoading(false);
    };

    loadUserFromStorage();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await loginUser({ email, senha: password });
      if (response.sucesso) {
        setUser(response.usuario);
        await AsyncStorage.setItem('user', JSON.stringify(response.usuario));
      }
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      return { sucesso: false, erro: 'An unexpected error occurred.' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await registerUser({ nome: name, email, senha: password });
      if (response.sucesso) {
        setUser(response.usuario);
        await AsyncStorage.setItem('user', JSON.stringify(response.usuario));
      }
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      return { sucesso: false, erro: 'An unexpected error occurred.' };
    }
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('user');
  };

  const updateUser = async (updatedUser) => {
    setUser(updatedUser);
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
  };


  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
