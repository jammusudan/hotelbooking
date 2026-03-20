import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create Axios Instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true, // Important for cookies
});

api.interceptors.request.use((config) => {
  const path = window.location?.pathname || '';
  let role = 'customer';
  
  // Base path assumption (good for login pages before session exists)
  if (path.startsWith('/admin')) role = 'admin';
  else if (path.startsWith('/manager')) role = 'manager';

  // Deterministic override from actual session configuration
  try {
    const savedUser = sessionStorage.getItem('user');
    if (savedUser && savedUser !== 'undefined') {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser?.role) {
        role = parsedUser.role;
      }
    }
  } catch (e) {}
  
  if (config.headers && typeof config.headers.set === 'function') {
    config.headers.set('x-active-role', role);
  } else {
    config.headers = { ...config.headers, 'x-active-role': role };
  }
  
  // Bulletproof fallback: query param survives CORS header stripping
  config.params = { ...config.params, activeRole: role };
  
  return config;
});

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = sessionStorage.getItem('user');
      return savedUser && savedUser !== 'undefined' ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get('/auth/profile');
        setUser(data);
        sessionStorage.setItem('user', JSON.stringify(data));
      } catch (error) {
        // Not logged in or token expired
        setUser(null);
        sessionStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data);
    sessionStorage.setItem('user', JSON.stringify(data));
    return data;
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    setUser(data);
    sessionStorage.setItem('user', JSON.stringify(data));
    return data;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
    sessionStorage.removeItem('user');
  };

  const forgotPassword = async (email) => {
    return await api.post('/auth/forgotpassword', { email });
  };

  const resetPassword = async (token, password) => {
    return await api.put(`/auth/resetpassword/${token}`, { password });
  };

  const verifyEmail = async (token) => {
    return await api.get(`/auth/verifyemail/${token}`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, forgotPassword, resetPassword, verifyEmail }}>
      {children}
    </AuthContext.Provider>
  );
};
