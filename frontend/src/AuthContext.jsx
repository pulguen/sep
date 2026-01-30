import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, setTokens } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('username');
    if (token && savedUser) {
      setUser({ username: savedUser });
    } else if (token) {
      setUser({ username: 'usuario' });
    }
    setInitializing(false);
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/token/', { username, password });
    const { access, refresh } = res.data;
    setTokens({ access, refresh });
    setUser({ username });
    localStorage.setItem('username', username);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('username');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, initializing }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
