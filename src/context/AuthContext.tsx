
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User, Role } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  userRole: Role | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        // If user is authenticated, we can proceed to get their data
        // The user data listener is set up in the next useEffect, and loading
        // will be handled there after data is fetched.
      } else {
        // User is logged out, clear all data and finish loading.
        setCurrentUser(null);
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    let unsubscribeUser: (() => void) | undefined;
    let unsubscribeRole: (() => void) | undefined;

    if (firebaseUser) {
      // User is logged in, fetch their data from Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const userData = { id: docSnap.id, ...docSnap.data() } as User;
          setCurrentUser(userData);

          // Now, listen for role changes based on the user's roleId
          if (userData.roleId) {
            const roleDocRef = doc(db, 'roles', userData.roleId);
            unsubscribeRole = onSnapshot(roleDocRef, (roleSnap) => {
              if (roleSnap.exists()) {
                setUserRole({ id: roleSnap.id, ...roleSnap.data() } as Role);
              } else {
                setUserRole(null);
              }
              setLoading(false); // Finish loading after role is fetched
            });
          } else {
            setUserRole(null);
            setLoading(false); // Finish loading if no roleId
          }
        } else {
          // User exists in Auth but not in Firestore, treat as logged out
          setCurrentUser(null);
          setUserRole(null);
          setLoading(false); // Finish loading
        }
      });
    } else {
      // No firebaseUser, so we are not waiting for any data.
      // The onAuthStateChanged listener handles setting loading to false.
    }

    return () => {
      if (unsubscribeUser) unsubscribeUser();
      if (unsubscribeRole) unsubscribeRole();
    };
  }, [firebaseUser]);


  const logout = async () => {
    await auth.signOut();
    setCurrentUser(null);
    setFirebaseUser(null);
    setUserRole(null);
    router.push('/login');
  };

  const value = {
    currentUser,
    setCurrentUser,
    userRole,
    firebaseUser,
    loading,
    logout,
  };

  // Do not render children until the initial auth check and data fetch is complete
  return (
    <AuthContext.Provider value={value}>
      {loading ? null : children}
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
