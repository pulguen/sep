import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { api, setTokens } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => null);
  const [initializing, setInitializing] = useState(true);
  const logoutTimerRef = useRef(null);

  const clearLogoutTimer = () => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  };

  const parseJwt = (token) => {
    try {
      const payload = token.split('.')[1];
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(normalized);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  };

  const scheduleLogout = (token) => {
    clearLogoutTimer();
    const payload = parseJwt(token);
    if (!payload || !payload.exp) return;
    const expiresAtMs = payload.exp * 1000;
    const delay = Math.max(expiresAtMs - Date.now(), 0);
    logoutTimerRef.current = setTimeout(() => {
      logout();
    }, delay);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('username');
    if (token) {
      const payload = parseJwt(token);
      const isExpired = payload?.exp ? payload.exp * 1000 <= Date.now() : false;
      if (isExpired) {
        logout();
      } else {
        scheduleLogout(token);
        if (savedUser) setUser({ username: savedUser });
        else setUser({ username: 'usuario' });
      }
    }
    setInitializing(false);
    const onTokenRefresh = (e) => {
      const access = e.detail?.access;
      if (access) scheduleLogout(access);
    };
    window.addEventListener('token-refreshed', onTokenRefresh);
    return () => {
      clearLogoutTimer();
      window.removeEventListener('token-refreshed', onTokenRefresh);
    };
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/token/', { username, password });
    const { access, refresh } = res.data;
    setTokens({ access, refresh });
    setUser({ username });
    localStorage.setItem('username', username);
    scheduleLogout(access);
    return res;
  };

  const logout = () => {
    clearLogoutTimer();
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
