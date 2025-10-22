import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await SecureStore.getItemAsync('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, senha_hash) => {
    try {
      const response = await api.post('/Lyria/login', { email, senha_hash });
      if (response.data.status === 'ok') {
        // Fetch full user details to get the ID
        const userDetailsResponse = await api.get(`/Lyria/usuarios/${email}`);
        const fullUserData = userDetailsResponse.data.usuario;

        setUser(fullUserData);
        await SecureStore.setItemAsync('user', JSON.stringify(fullUserData));
        return { success: true };
      } else {
        return { success: false, error: response.data.erro };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: 'Erro ao fazer login' };
    }
  };

  const logout = async () => {
    try {
      await api.post('/Lyria/logout');
      setUser(null);
      await SecureStore.deleteItemAsync('user');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const updateUser = (newUserData) => {
    setUser(newUserData);
    SecureStore.setItemAsync('user', JSON.stringify(newUserData));
  }


  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
