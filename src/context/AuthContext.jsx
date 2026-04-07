/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { API_BASE } from '../services/api';

const AuthContext = createContext(null);

async function parseJsonResponse(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      'Could not read the server response. Check that the CivicFix API is running (backend on port 3000).'
    );
  }
}

function normalizeEmail(email) {
  return String(email ?? '')
    .trim()
    .toLowerCase();
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('civicfix_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await parseJsonResponse(res);

        if (!res.ok) {
          localStorage.removeItem('civicfix_token');
          setToken(null);
          setUser(null);
          return;
        }

        setUser(data.data.user);
      } catch {
        // If auth check fails, clear token so UI doesn't get stuck.
        localStorage.removeItem('civicfix_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadMe();
  }, [token]);

  const signup = async ({ name, email, password }) => {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: String(name ?? '').trim(),
        email: normalizeEmail(email),
        password: String(password ?? ''),
      })
    });
    const data = await parseJsonResponse(res);
    if (!res.ok) throw new Error(data.error?.message || 'Signup failed');
    if (!data.data?.token) throw new Error('Signup succeeded but no token was returned.');

    localStorage.setItem('civicfix_token', data.data.token);
    setToken(data.data.token);
    setUser(data.data.user);
    return data.data.user;
  };

  const login = async ({ email, password }) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: normalizeEmail(email),
        password: String(password ?? ''),
      })
    });
    const data = await parseJsonResponse(res);
    if (!res.ok) {
      throw new Error(
        data.error?.message || `Login failed (${res.status}). Check your email and password.`
      );
    }
    if (!data.data?.token) throw new Error('Login succeeded but no token was returned.');

    localStorage.setItem('civicfix_token', data.data.token);
    setToken(data.data.token);
    setUser(data.data.user);
    return data.data.user;
  };

  const logout = () => {
    localStorage.removeItem('civicfix_token');
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ token, user, loading, signup, login, logout }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

