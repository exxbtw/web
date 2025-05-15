import React, { createContext, useState, useEffect } from 'react';

// Создаём контекст
export const AuthContext = createContext();

// Провайдер контекста
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'));
  const [username, setUsername] = useState(localStorage.getItem('username') || '');

  // Функция для входа
  const login = (accessToken, username) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('username', username);
    setIsAuthenticated(true);
    setUsername(username);
  };

  // Функция для выхода
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setUsername('');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};