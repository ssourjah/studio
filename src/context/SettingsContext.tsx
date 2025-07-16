
'use client';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface SettingsContextType {
    companyName: string;
    setCompanyName: (name: string) => Promise<void>;
    logoUrlLight: string | null;
    setLogoUrlLight: (url: string | null) => Promise<void>;
    logoUrlDark: string | null;
    setLogoUrlDark: (url: string | null) => Promise<void>;
    disableAdminLogin: boolean;
    setDisableAdminLogin: (disabled: boolean) => Promise<void>;
    loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const companySettingsDocRef = doc(db, 'settings', 'company');
const adminSettingsDocRef = doc(db, 'settings', 'admin');


export function SettingsProvider({ children }: { children: ReactNode }) {
    const [companyName, setCompanyNameState] = useState('TaskMaster Pro');
    const [logoUrlLight, setLogoUrlLightState] = useState<string | null>(null);
    const [logoUrlDark, setLogoUrlDarkState] = useState<string | null>(null);
    const [disableAdminLogin, setDisableAdminLoginState] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const unsubs: (() => void)[] = [];

        const unsubCompany = onSnapshot(companySettingsDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setCompanyNameState(data.companyName || 'TaskMaster Pro');
                setLogoUrlLightState(data.logoUrlLight || null);
                setLogoUrlDarkState(data.logoUrlDark || null);
            }
        }, (error) => console.error("Error fetching company settings:", error));
        unsubs.push(unsubCompany);

        const unsubAdmin = onSnapshot(adminSettingsDocRef, (docSnap) => {
             if (docSnap.exists()) {
                const data = docSnap.data();
                setDisableAdminLoginState(data.disableAdminLogin || false);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching admin settings:", error);
            setLoading(false);
        });
        unsubs.push(unsubAdmin);
        
        return () => {
            unsubs.forEach(unsub => unsub());
        };
    }, []);

    const setCompanyName = async (name: string) => {
        await setDoc(companySettingsDocRef, { companyName: name }, { merge: true });
    };

    const setLogoUrlLight = async (url: string | null) => {
        await setDoc(companySettingsDocRef, { logoUrlLight: url }, { merge: true });
    };

    const setLogoUrlDark = async (url: string | null) => {
        await setDoc(companySettingsDocRef, { logoUrlDark: url }, { merge: true });
    };
    
    const setDisableAdminLogin = async (disabled: boolean) => {
        await setDoc(adminSettingsDocRef, { disableAdminLogin: disabled }, { merge: true });
    };

    const value = {
        companyName,
        setCompanyName,
        logoUrlLight,
        setLogoUrlLight,
        logoUrlDark,
        setLogoUrlDark,
        disableAdminLogin,
        setDisableAdminLogin,
        loading
    };

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
