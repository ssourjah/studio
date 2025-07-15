
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
      setLoading(true);
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const unsubscribeUser = onSnapshot(userDocRef, (userSnap) => {
          if (userSnap.exists()) {
            const userData = { id: userSnap.id, ...userSnap.data() } as User;
            setCurrentUser(userData);

            // Sync database preference with local storage
            const dbTheme = userData.preferences?.theme || 'system';
            if (localStorage.getItem('theme') !== dbTheme) {
              localStorage.setItem('theme', dbTheme);
            }

            if (userData.roleId) {
              const roleDocRef = doc(db, 'roles', userData.roleId);
              const unsubscribeRole = onSnapshot(roleDocRef, (roleSnap) => {
                setUserRole(roleSnap.exists() ? { id: roleSnap.id, ...roleSnap.data() } as Role : null);
                setLoading(false); 
              }, () => setLoading(false));
              return () => unsubscribeRole();
            } else {
              setUserRole(null);
              setLoading(false);
            }
          } else {
            setCurrentUser(null);
            setUserRole(null);
            setLoading(false);
          }
        }, () => {
            setCurrentUser(null);
            setUserRole(null);
            setLoading(false);
        });
        return () => unsubscribeUser();
      } else {
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
