
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User, Role } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  userRole: Role | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const unsubscribeUser = onSnapshot(userDocRef, (userSnap) => {
          if (userSnap.exists()) {
            const userData = { id: userSnap.id, ...userSnap.data() } as User;
            setCurrentUser(userData);

            // Apply theme from user preferences
            const theme = userData.preferences?.theme || 'system';
            document.documentElement.classList.remove('light', 'dark');
            if (theme === 'system') {
                const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.classList.add(systemIsDark ? 'dark' : 'light');
            } else {
                document.documentElement.classList.add(theme);
            }

            if (userData.roleId) {
              const roleDocRef = doc(db, 'roles', userData.roleId);
              const unsubscribeRole = onSnapshot(roleDocRef, (roleSnap) => {
                if (roleSnap.exists()) {
                  setUserRole({ id: roleSnap.id, ...roleSnap.data() } as Role);
                } else {
                  setUserRole(null);
                }
                setLoading(false);
              });
              return () => unsubscribeRole();
            } else {
              setUserRole(null);
              setLoading(false);
            }
          } else {
            // User in Auth but not Firestore. Log them out.
            setCurrentUser(null);
            setUserRole(null);
            setLoading(false);
          }
        }, (error) => {
            console.error("Error in user snapshot listener:", error);
            setCurrentUser(null);
            setUserRole(null);
            setLoading(false);
        });
        return () => unsubscribeUser();
      } else {
        // User is logged out.
        setCurrentUser(null);
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const logout = async () => {
    await auth.signOut();
    setCurrentUser(null);
    setUserRole(null);
    router.push('/login');
  };

  const value = {
    currentUser,
    setCurrentUser,
    userRole,
    loading,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
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
