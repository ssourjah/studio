
'use client';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface SmtpSettings {
    smtpHost: string;
    smtpPort: string;
    smtpUser: string;
    smtpPassword?: string;
}

interface SettingsContextType {
    companyName: string;
    setCompanyName: (name: string) => Promise<void>;
    logoUrlLight: string | null;
    setLogoUrlLight: (url: string | null) => Promise<void>;
    logoUrlDark: string | null;
    setLogoUrlDark: (url: string | null) => Promise<void>;
    disableAdminLogin: boolean;
    setDisableAdminLogin: (disabled: boolean) => Promise<void>;
    smtpSettings: SmtpSettings;
    setSmtpSettings: (settings: SmtpSettings) => Promise<void>;
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
    const [smtpSettings, setSmtpSettingsState] = useState<SmtpSettings>({
        smtpHost: '',
        smtpPort: '',
        smtpUser: '',
        smtpPassword: '',
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                // Fetch public company settings
                const companyDocSnap = await getDoc(companySettingsDocRef);
                if (companyDocSnap.exists()) {
                    const data = companyDocSnap.data();
                    setCompanyNameState(data.companyName || 'TaskMaster Pro');
                    setLogoUrlLightState(data.logoUrlLight || null);
                    setLogoUrlDarkState(data.logoUrlDark || null);
                }

                // Fetch private admin settings
                const adminDocSnap = await getDoc(adminSettingsDocRef);
                if (adminDocSnap.exists()) {
                    const data = adminDocSnap.data();
                    setDisableAdminLoginState(data.disableAdminLogin || false);
                    setSmtpSettingsState({
                        smtpHost: data.smtpHost || '',
                        smtpPort: data.smtpPort || '',
                        smtpUser: data.smtpUser || '',
                        smtpPassword: data.smtpPassword || '',
                    });
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const setCompanyName = async (name: string) => {
        setCompanyNameState(name);
        await setDoc(companySettingsDocRef, { companyName: name }, { merge: true });
    };

    const setLogoUrlLight = async (url: string | null) => {
        setLogoUrlLightState(url);
        await setDoc(companySettingsDocRef, { logoUrlLight: url }, { merge: true });
    };

    const setLogoUrlDark = async (url: string | null) => {
        setLogoUrlDarkState(url);
        await setDoc(companySettingsDocRef, { logoUrlDark: url }, { merge: true });
    };

    const setDisableAdminLogin = async (disabled: boolean) => {
        setDisableAdminLoginState(disabled);
        await setDoc(adminSettingsDocRef, { disableAdminLogin: disabled }, { merge: true });
    };
    
    const setSmtpSettings = async (settings: SmtpSettings) => {
        setSmtpSettingsState(settings);
        await setDoc(adminSettingsDocRef, settings, { merge: true });
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
        smtpSettings,
        setSmtpSettings,
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
