
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
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const userData = { id: docSnap.id, ...docSnap.data() } as User;
          setCurrentUser(userData);
        } else {
          setCurrentUser(null);
          setUserRole(null);
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    let unsubscribeRole: () => void;
    let roleLoading = false;

    if (currentUser && currentUser.roleId) {
        roleLoading = true;
        setLoading(true);
        const roleDocRef = doc(db, 'roles', currentUser.roleId);
        unsubscribeRole = onSnapshot(roleDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setUserRole({ id: docSnap.id, ...docSnap.data() } as Role);
            } else {
                setUserRole(null);
            }
            setLoading(false);
            roleLoading = false;
        });
    } else {
       setUserRole(null);
       if (!roleLoading) {
           setLoading(false);
       }
    }
    
    return () => {
        if (unsubscribeRole) {
            unsubscribeRole();
        }
    };

  }, [currentUser]);


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

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
