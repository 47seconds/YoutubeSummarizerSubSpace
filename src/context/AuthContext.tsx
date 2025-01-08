import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSignInEmailPassword, useSignOut } from '@nhost/react';
import { useNavigate } from 'react-router-dom';

interface AuthContextProps {
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => void;
  signOut: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC = ({ children }) => {
  const { signInEmailPassword, isLoading, error } = useSignInEmailPassword();
  const { signOut } = useSignOut();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // You can check the user’s authentication status on initial load
    // For instance, checking a token in local storage or via Nhost’s useAuthenticationStatus hook
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    const { isError, error } = await signInEmailPassword(email, password);
    if (isError) {
      setAuthError(error?.message || 'An error occurred during sign in');
    } else {
      setIsAuthenticated(true);
      localStorage.setItem('authToken', 'your-auth-token'); // You would replace this with your actual token
      navigate('/');
    }
  };

  const handleSignOut = () => {
    signOut();
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, signIn, signOut: handleSignOut, isLoading, error: authError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
