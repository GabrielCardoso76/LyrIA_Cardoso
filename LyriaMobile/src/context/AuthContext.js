import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser, registerUser } from '../services/LyriaApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Set to false as we no longer load from storage

  const login = async (email, password) => {
    try {
      const response = await loginUser({ email, senha: password });
      if (response.sucesso) {
        setUser(response.usuario);
      }
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      return error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await registerUser({ nome: name, email, senha: password });
      if (response.sucesso) {
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
    setUser(null);
  };

  const updateUser = async (updatedUser) => {
    setUser(updatedUser);
  };


  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
