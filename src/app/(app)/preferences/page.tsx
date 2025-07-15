
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ThemePreference, FontSizePreference, UserPreferences, ColorTheme } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Sun, Moon, Laptop, Type, Palette, Paintbrush, Undo2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { hexToHsl, hslToHex } from '@/lib/utils';


function ColorPicker({ label, color, onChange }: { label: string, color: string, onChange: (value: string) => void }) {
    const hexColor = hslToHex(color);

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newHex = e.target.value;
        const newHsl = hexToHsl(newHex);
        onChange(newHsl);
    };

    return (
        <div className="space-y-2">
            <Label className="text-sm">{label}</Label>
            <div className="flex items-center gap-2">
                <Input type="color" value={hexColor} onChange={handleColorChange} className="h-10 w-12 p-1" />
                <Input type="text" value={hexColor.toUpperCase()} onChange={handleColorChange} className="h-10" />
            </div>
        </div>
    );
}

const defaultLight: ColorTheme = {
    background: '0 0% 100%',
    foreground: '222.2 84% 4.9%',
    card: '0 0% 100%',
    primary: '222.2 47.4% 11.2%',
    accent: '210 40% 96.1%',
};

const defaultDark: ColorTheme = {
    background: '222.2 84% 4.9%',
    foreground: '210 40% 98%',
    card: '222.2 84% 4.9%',
    primary: '210 40% 98%',
    accent: '217.2 32.6% 17.5%',
};

export default function PreferencesPage() {
    const { currentUser, setCurrentUser } = useAuth();
    const { toast } = useToast();
    const [selectedTheme, setSelectedTheme] = useState<ThemePreference>('system');
    const [selectedFontSize, setSelectedFontSize] = useState<FontSizePreference>('base');
    const [isSaving, setIsSaving] = useState(false);
    
    const [lightThemeColors, setLightThemeColors] = useState<ColorTheme>(defaultLight);
    const [darkThemeColors, setDarkThemeColors] = useState<ColorTheme>(defaultDark);

    useEffect(() => {
        if (currentUser?.preferences) {
            const { theme, fontSize, customLightTheme, customDarkTheme } = currentUser.preferences;
            if (theme) setSelectedTheme(theme);
            if (fontSize) setSelectedFontSize(fontSize);
            if (customLightTheme) setLightThemeColors(customLightTheme);
            else setLightThemeColors(defaultLight);

            if (customDarkTheme) setDarkThemeColors(customDarkTheme);
            else setDarkThemeColors(defaultDark)
        }
    }, [currentUser]);

    // Effect for real-time theme preview
    useEffect(() => {
        const styleId = 'custom-theme-preview';
        let styleElement = document.getElementById(styleId);

        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            document.head.appendChild(styleElement);
        }

        const lightVars = Object.entries(lightThemeColors).map(([key, value]) => `--${key}: ${value};`).join(' ');
        const darkVars = Object.entries(darkThemeColors).map(([key, value]) => `--${key}: ${value};`).join(' ');

        styleElement.innerHTML = `
            :root { ${lightVars} }
            .dark { ${darkVars} }
        `;
        
        // Cleanup function to remove the preview styles when the user navigates away without saving
        return () => {
            if (currentUser?.preferences) {
                applyThemeFromPreferences(currentUser.preferences);
            }
        };

    }, [lightThemeColors, darkThemeColors, currentUser?.preferences]);

    const applyThemeFromPreferences = (preferences: UserPreferences) => {
        const styleId = 'custom-theme-preview';
        let styleElement = document.getElementById(styleId);
        if (!styleElement) return;

        const { customLightTheme, customDarkTheme } = preferences;
        const lightVars = customLightTheme ? Object.entries(customLightTheme).map(([key, value]) => `--${key}: ${value};`).join(' ') : Object.entries(defaultLight).map(([key, value]) => `--${key}: ${value};`).join(' ');
        const darkVars = customDarkTheme ? Object.entries(customDarkTheme).map(([key, value]) => `--${key}: ${value};`).join(' ') : Object.entries(defaultDark).map(([key, value]) => `--${key}: ${value};`).join(' ');

        styleElement.innerHTML = `
            :root { ${lightVars} }
            .dark { ${darkVars} }
        `;
    }

    const applyTheme = (theme: ThemePreference) => {
        localStorage.setItem('theme', theme);
        document.documentElement.classList.remove('light', 'dark');
        if (theme === 'system') {
            const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.classList.add(systemIsDark ? 'dark' : 'light');
        } else {
            document.documentElement.classList.add(theme);
        }
    };

    const applyFontSize = (size: FontSizePreference) => {
        localStorage.setItem('fontSize', size);
        document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg');
        document.documentElement.classList.add(`text-${size}`);
    };
    
    const handleThemeChange = (theme: ThemePreference) => {
        setSelectedTheme(theme);
        applyTheme(theme);
    };

    const handleFontSizeChange = (size: FontSizePreference) => {
        setSelectedFontSize(size);
        applyFontSize(size);
    };

    const handleSave = async () => {
        if (!currentUser) return;
        setIsSaving(true);
        const userDocRef = doc(db, 'users', currentUser.id);
        
        try {
            const newPreferences: UserPreferences = { 
                ...currentUser.preferences, 
                theme: selectedTheme,
                fontSize: selectedFontSize,
                customLightTheme: lightThemeColors,
                customDarkTheme: darkThemeColors
            };
            await updateDoc(userDocRef, { preferences: newPreferences });

            // Optimistically update local user state
            setCurrentUser({ ...currentUser, preferences: newPreferences });
            
            // Also update local storage upon saving
            localStorage.setItem('theme', selectedTheme);
            localStorage.setItem('fontSize', selectedFontSize);

            toast({
                title: 'Preferences Saved',
                description: 'Your new settings have been applied.',
            });
        } catch (error) {
            console.error("Error saving preferences: ", error);
            toast({
                title: 'Error',
                description: 'Could not save your preferences.',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>
                        Customize the look and feel of the application to your liking.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="space-y-4">
                        <Label className="text-base">Theme</Label>
                        <p className="text-sm text-muted-foreground">Select the color scheme for the application.</p>
                        <RadioGroup
                            value={selectedTheme}
                            onValueChange={handleThemeChange}
                            className="grid max-w-md grid-cols-1 gap-4 sm:grid-cols-3"
                        >
                            <div>
                                <RadioGroupItem value="light" id="light" className="peer sr-only" />
                                <Label
                                    htmlFor="light"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                    <Sun className="mb-3 h-6 w-6" />
                                    Light
                                </Label>
                            </div>
                             <div>
                                <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                                <Label
                                    htmlFor="dark"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                    <Moon className="mb-3 h-6 w-6" />
                                    Dark
                                </Label>
                            </div>
                             <div>
                                <RadioGroupItem value="system" id="system" className="peer sr-only" />
                                <Label
                                    htmlFor="system"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                    <Laptop className="mb-3 h-6 w-6" />
                                    System
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-base">Font Size</Label>
                        <p className="text-sm text-muted-foreground">Adjust the text size for readability.</p>
                         <RadioGroup
                            value={selectedFontSize}
                            onValueChange={handleFontSizeChange}
                            className="grid max-w-md grid-cols-1 gap-4 sm:grid-cols-3"
                        >
                             <div>
                                <RadioGroupItem value="sm" id="sm" className="peer sr-only" />
                                <Label
                                    htmlFor="sm"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                    <Type className="mb-3 h-6 w-6" />
                                    <span className="text-sm">Small</span>
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="base" id="base" className="peer sr-only" />
                                <Label
                                    htmlFor="base"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                    <Type className="mb-3 h-6 w-6" />
                                    <span className="text-base">Medium</span>
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="lg" id="lg" className="peer sr-only" />
                                <Label
                                    htmlFor="lg"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                    <Type className="mb-3 h-6 w-6" />
                                    <span className="text-lg">Large</span>
                                </Label>
                            </div>
                         </RadioGroup>
                    </div>

                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className='flex items-center gap-2'>
                        <Palette className="h-6 w-6" />
                        <CardTitle>Theme Customization</CardTitle>
                    </div>
                    <CardDescription>
                        Fine-tune the colors for light and dark themes. Changes are applied instantly.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="light_theme">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="light_theme"><Sun className="mr-2 h-4 w-4" />Light Theme</TabsTrigger>
                            <TabsTrigger value="dark_theme"><Moon className="mr-2 h-4 w-4" />Dark Theme</TabsTrigger>
                        </TabsList>
                        <TabsContent value="light_theme" className="pt-4">
                             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <ColorPicker label="Background" color={lightThemeColors.background} onChange={(value) => setLightThemeColors(p => ({...p, background: value}))} />
                                <ColorPicker label="Foreground (Text)" color={lightThemeColors.foreground} onChange={(value) => setLightThemeColors(p => ({...p, foreground: value}))} />
                                <ColorPicker label="Card" color={lightThemeColors.card} onChange={(value) => setLightThemeColors(p => ({...p, card: value}))} />
                                <ColorPicker label="Primary" color={lightThemeColors.primary} onChange={(value) => setLightThemeColors(p => ({...p, primary: value}))} />
                                <ColorPicker label="Accent" color={lightThemeColors.accent} onChange={(value) => setLightThemeColors(p => ({...p, accent: value}))} />
                            </div>
                             <Button variant="outline" className="mt-6" onClick={() => setLightThemeColors(defaultLight)}>
                                <Undo2 className="mr-2 h-4 w-4" />
                                Reset to Default
                            </Button>
                        </TabsContent>
                        <TabsContent value="dark_theme" className="pt-4">
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <ColorPicker label="Background" color={darkThemeColors.background} onChange={(value) => setDarkThemeColors(p => ({...p, background: value}))} />
                                <ColorPicker label="Foreground (Text)" color={darkThemeColors.foreground} onChange={(value) => setDarkThemeColors(p => ({...p, foreground: value}))} />
                                <ColorPicker label="Card" color={darkThemeColors.card} onChange={(value) => setDarkThemeColors(p => ({...p, card: value}))} />
                                <ColorPicker label="Primary" color={darkThemeColors.primary} onChange={(value) => setDarkThemeColors(p => ({...p, primary: value}))} />
                                <ColorPicker label="Accent" color={darkThemeColors.accent} onChange={(value) => setDarkThemeColors(p => ({...p, accent: value}))} />
                            </div>
                             <Button variant="outline" className="mt-6" onClick={() => setDarkThemeColors(defaultDark)}>
                                <Undo2 className="mr-2 h-4 w-4" />
                                Reset to Default
                            </Button>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <Button onClick={handleSave} disabled={isSaving}>
                <Paintbrush className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save All Preferences'}
            </Button>
        </div>
    );

    
}
