
'use client';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface SettingsContextType {
    companyName: string;
    setCompanyName: (name: string) => Promise<void>;
    logoUrl: string | null;
    setLogoUrl: (url: string | null) => Promise<void>;
    avatarUrl: string | null;
    setAvatarUrl: (url: string | null) => void;
    disableAdminLogin: boolean;
    setDisableAdminLogin: (disabled: boolean) => Promise<void>;
    loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Define a single document reference for company settings
const settingsDocRef = doc(db, 'settings', 'company');

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [companyName, setCompanyNameState] = useState('TaskMaster Pro');
    const [logoUrl, setLogoUrlState] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [disableAdminLogin, setDisableAdminLoginState] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const docSnap = await getDoc(settingsDocRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setCompanyNameState(data.companyName || 'TaskMaster Pro');
                    setLogoUrlState(data.logoUrl || null);
                    setDisableAdminLoginState(data.disableAdminLogin || false);
                }
            } catch (error) {
                console.error("Error fetching company settings:", error);
                // Defaults are already set, so we can just log the error
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const setCompanyName = async (name: string) => {
        setCompanyNameState(name);
        await setDoc(settingsDocRef, { companyName: name }, { merge: true });
    };

    const setLogoUrl = async (url: string | null) => {
        setLogoUrlState(url);
        await setDoc(settingsDocRef, { logoUrl: url }, { merge: true });
    };

    const setDisableAdminLogin = async (disabled: boolean) => {
        setDisableAdminLoginState(disabled);
        await setDoc(settingsDocRef, { disableAdminLogin: disabled }, { merge: true });
    };

    const value = {
        companyName,
        setCompanyName,
        logoUrl,
        setLogoUrl,
        avatarUrl,
        setAvatarUrl,
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
