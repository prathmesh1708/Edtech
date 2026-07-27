import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('sw_token') || null);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('sw_user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Validate session if needed
    if (token && !user) {
      const storedUser = localStorage.getItem('sw_user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          localStorage.removeItem('sw_token');
          localStorage.removeItem('sw_user');
          setUser(null);
          setToken(null);
        }
      }
    }
    setLoading(false);
  }, [token, user]);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('sw_token', authToken);
    localStorage.setItem('sw_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('sw_token');
    localStorage.removeItem('sw_user');
  };

  const updateProfile = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('sw_user', JSON.stringify(updated));
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user, token, loading, isAuthenticated, isAdmin,
      login, logout, updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
