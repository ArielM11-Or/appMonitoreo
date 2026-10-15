import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types/models';
import { MOCK_USERS } from '../services/mock-data';

interface AuthContextType {
  currentUser: UserProfile;
  role: UserRole;
  switchRole: (newRole: UserRole) => void;
  loginAsDriver: (driverKey?: 'driver1' | 'driver2') => void;
  loginAsAdmin: () => void;
  loginAsPublic: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_USERS.driver1);

  const switchRole = (newRole: UserRole) => {
    if (newRole === 'driver') {
      setCurrentUser(MOCK_USERS.driver1);
    } else if (newRole === 'admin') {
      setCurrentUser(MOCK_USERS.admin);
    } else {
      setCurrentUser(MOCK_USERS.public);
    }
  };

  const loginAsDriver = (driverKey: 'driver1' | 'driver2' = 'driver1') => {
    setCurrentUser(MOCK_USERS[driverKey]);
  };

  const loginAsAdmin = () => {
    setCurrentUser(MOCK_USERS.admin);
  };

  const loginAsPublic = () => {
    setCurrentUser(MOCK_USERS.public);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser.role,
        switchRole,
        loginAsDriver,
        loginAsAdmin,
        loginAsPublic,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
