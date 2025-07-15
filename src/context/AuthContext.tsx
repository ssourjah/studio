
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User, Role, ColorTheme } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  userRole: Role | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function applyCustomTheme(lightTheme: ColorTheme | null, darkTheme: ColorTheme | null) {
    const styleId = 'user-custom-theme';
    let styleElement = document.getElementById(styleId);

    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
    }
    
    const lightVars = lightTheme ? Object.entries(lightTheme).map(([key, value]) => `--${key}: ${value};`).join(' ') : '';
    const darkVars = darkTheme ? Object.entries(darkTheme).map(([key, value]) => `--${key}: ${value};`).join(' ') : '';

    styleElement.innerHTML = `
        :root { ${lightVars} }
        .dark { ${darkVars} }
    `;
}

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

            const prefs = userData.preferences || {};
            
            // Apply visual preferences
            const dbTheme = prefs.theme || 'system';
            if (localStorage.getItem('theme') !== dbTheme) {
              localStorage.setItem('theme', dbTheme);
            }
            document.documentElement.classList.remove('light', 'dark');
            if (dbTheme === 'system') {
                const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.classList.add(systemIsDark ? 'dark' : 'light');
            } else {
                document.documentElement.classList.add(dbTheme);
            }

            const dbFontSize = prefs.fontSize || 'base';
            if (localStorage.getItem('fontSize') !== dbFontSize) {
              localStorage.setItem('fontSize', dbFontSize);
            }
            document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg');
            document.documentElement.classList.add(`text-${dbFontSize}`);

            applyCustomTheme(prefs.customLightTheme || null, prefs.customDarkTheme || null);

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
