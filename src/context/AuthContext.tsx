import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';

// Define the shape of the user object
interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_premium: boolean;
}

// Define the shape of the context state
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // This function handles manual logout or clearing an invalid session
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    delete axios.defaults.headers.common['Authorization'];
  };

   const refreshUser = async () => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      try {
        const res = await axios.get('http://localhost:5000/api/auth/me');
        setUser(res.data); // Re-fetch and update user data
        setToken(storedToken);
      } catch (error) {
        console.error("Token validation failed during refresh, logging out.", error);
        logout();
      }
    }
  };
  // This hook runs ONLY ONCE on initial app load to check for a persistent session
  useEffect(() => {
    const loadUserFromToken = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        try {
          const res = await axios.get('http://localhost:5000/api/auth/me');
          setUser(res.data);
          setToken(storedToken);
        } catch (error) {
          // If the stored token is invalid or expired, log the user out
          console.error("Token validation failed on initial load, logging out.", error);
          logout();
        }
      }
      setLoading(false);
    };

    loadUserFromToken();
  }, []); // Empty array ensures this runs only once

  // --- THIS IS THE CORRECTED AND FINAL LOGIN FUNCTION ---
  // It is now fully responsible for the entire login state update process.
  const login = async (newToken: string) => {
    // 1. Store the new token in localStorage for session persistence
    localStorage.setItem('token', newToken);
    await refreshUser(); 
    // 2. Set the Authorization header for all future Axios requests in this session
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

    try {
      // 3. Immediately fetch the user's data using the new token
      const res = await axios.get('http://localhost:5000/api/auth/me');

      // 4. Update the user and token state. This will cause all components
      //    subscribed to this context (like the Header) to re-render.
      setUser(res.data);
      setToken(newToken);
    } catch (error) {
      console.error("Failed to fetch user data after login.", error);
      // If something goes wrong, clean up to prevent a broken state
      logout();
    }
  };

   return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily consume the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};