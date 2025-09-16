import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react--native-async-storage/async-storage';
import { loginUser, registerUser } from '../services/LyriaApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Failed to load user from storage", e);
      } finally {
        setIsLoading(false);
      }
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
      // The error is already in the format { sucesso: false, erro: '...' }
      // from handleApiError in LyriaApi.js
      return error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await registerUser({ nome: name, email, senha: password });
      if (response.sucesso) {
        // After successful registration, log in to get the full user object
        const loginResponse = await login(email, password);
        return loginResponse;
      }
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      return error;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      await AsyncStorage.removeItem('user');
    } catch (e) {
        console.error("Failed to logout", e);
    }
  };

  const updateUser = async (updatedUser) => {
    try {
        setUser(updatedUser);
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (e) {
        console.error("Failed to update user in storage", e);
    }
  };


  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
