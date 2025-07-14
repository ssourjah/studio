
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
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        // User is logged in, fetch their data
        const userDocRef = doc(db, 'users', user.uid);
        try {
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
              const userData = { id: docSnap.id, ...docSnap.data() } as User;
              setCurrentUser(userData);
            } else {
              // User exists in Auth but not in Firestore, treat as logged out
              setCurrentUser(null);
              setUserRole(null);
            }
        } catch (error) {
            // Likely a permission error if rules are not set up correctly for users to read their own doc
            console.error("Error fetching user document:", error);
            setCurrentUser(null);
            setUserRole(null);
        }
      } else {
        // User is logged out
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    let unsubscribeRole: (() => void) | undefined;
  
    if (currentUser?.roleId) {
      const roleDocRef = doc(db, 'roles', currentUser.roleId);
      unsubscribeRole = onSnapshot(
        roleDocRef,
        (docSnap) => {
          if (docSnap.exists()) {
            setUserRole({ id: docSnap.id, ...docSnap.data() } as Role);
          } else {
            setUserRole(null);
          }
        },
        (error) => {
          console.error('Error fetching role:', error);
          setUserRole(null);
        }
      );
    } else {
      setUserRole(null);
    }
  
    return () => {
      if (unsubscribeRole) {
        unsubscribeRole();
      }
    };
  }, [currentUser?.roleId]);


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

  // Do not render children until the initial auth check is complete
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
