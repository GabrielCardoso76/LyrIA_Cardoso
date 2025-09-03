import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin } from '../services/LyriaApi';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for a logged-in user in localStorage on initial load
    try {
      const storedUser = localStorage.getItem('lyriaUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('lyriaUser');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const response = await apiLogin(credentials);
    if (response.sucesso) {
      setUser(response.usuario);
      setIsAuthenticated(true);
      localStorage.setItem('lyriaUser', JSON.stringify(response.usuario));
    }
    return response; // Return the full response so the UI can handle success/error messages
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('lyriaUser');
    // Here you would typically redirect to the login page
    // For now, we'll let the component that calls logout handle redirection
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  // We don't render anything until we've checked for the user in localStorage
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
