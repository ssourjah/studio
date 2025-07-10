'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

interface SettingsContextType {
    companyName: string;
    setCompanyName: (name: string) => void;
    logoUrl: string | null;
    setLogoUrl: (url: string | null) => void;
    avatarUrl: string | null;
    setAvatarUrl: (url: string | null) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [companyName, setCompanyName] = useState('TaskMaster Pro');
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    const value = {
        companyName,
        setCompanyName,
        logoUrl,
        setLogoUrl,
        avatarUrl,
        setAvatarUrl
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
