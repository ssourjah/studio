
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
import { Sun, Moon, Laptop, Type, Palette, Paintbrush } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

function HSLColorPicker({ label, color, onChange }: { label: string, color: string, onChange: (value: string) => void }) {
    const [h, s, l] = color.split(' ').map(v => parseInt(v, 10));

    const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(`${e.target.value} ${s}% ${l}%`);
    };
    
    const handleSaturationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(`${h} ${e.target.value}% ${l}%`);
    };

    const handleLightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
         onChange(`${h} ${s}% ${e.target.value}%`);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-sm">{label}</Label>
                <div 
                    className="h-6 w-10 rounded border" 
                    style={{ backgroundColor: `hsl(${h}, ${s}%, ${l}%)` }}
                />
            </div>
            <div className='space-y-2'>
                <div className="flex items-center gap-2">
                    <span className="w-2 text-xs font-medium">H</span>
                    <Input type="range" min="0" max="360" value={h} onChange={handleHueChange} className="p-0 h-2" />
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 text-xs font-medium">S</span>
                    <Input type="range" min="0" max="100" value={s} onChange={handleSaturationChange} className="p-0 h-2" />
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 text-xs font-medium">L</span>
                    <Input type="range" min="0" max="100" value={l} onChange={handleLightnessChange} className="p-0 h-2" />
                </div>
            </div>
        </div>
    );
}


export default function PreferencesPage() {
    const { currentUser, setCurrentUser } = useAuth();
    const { toast } = useToast();
    const [selectedTheme, setSelectedTheme] = useState<ThemePreference>('system');
    const [selectedFontSize, setSelectedFontSize] = useState<FontSizePreference>('base');
    const [isSaving, setIsSaving] = useState(false);

    const defaultLight: ColorTheme = {
        background: '240 10% 96%',
        foreground: '222 47% 11%',
        card: '0 0% 100%',
        primary: '236 41% 48%',
        accent: '240 5% 90%',
    };

    const defaultDark: ColorTheme = {
        background: '222 47% 11%',
        foreground: '210 40% 98%',
        card: '222 47% 11%',
        primary: '236 41% 48%',
        accent: '217 33% 17%',
    };
    
    const [lightThemeColors, setLightThemeColors] = useState<ColorTheme>(defaultLight);
    const [darkThemeColors, setDarkThemeColors] = useState<ColorTheme>(defaultDark);

    useEffect(() => {
        if (currentUser?.preferences) {
            const { theme, fontSize, customLightTheme, customDarkTheme } = currentUser.preferences;
            if (theme) setSelectedTheme(theme);
            if (fontSize) setSelectedFontSize(fontSize);
            if (customLightTheme) setLightThemeColors(customLightTheme);
            if (customDarkTheme) setDarkThemeColors(customDarkTheme);
        }
    }, [currentUser]);

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
                                <HSLColorPicker label="Background" color={lightThemeColors.background} onChange={(value) => setLightThemeColors(p => ({...p, background: value}))} />
                                <HSLColorPicker label="Foreground (Text)" color={lightThemeColors.foreground} onChange={(value) => setLightThemeColors(p => ({...p, foreground: value}))} />
                                <HSLColorPicker label="Card" color={lightThemeColors.card} onChange={(value) => setLightThemeColors(p => ({...p, card: value}))} />
                                <HSLColorPicker label="Primary" color={lightThemeColors.primary} onChange={(value) => setLightThemeColors(p => ({...p, primary: value}))} />
                                <HSLColorPicker label="Accent" color={lightThemeColors.accent} onChange={(value) => setLightThemeColors(p => ({...p, accent: value}))} />
                            </div>
                        </TabsContent>
                        <TabsContent value="dark_theme" className="pt-4">
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <HSLColorPicker label="Background" color={darkThemeColors.background} onChange={(value) => setDarkThemeColors(p => ({...p, background: value}))} />
                                <HSLColorPicker label="Foreground (Text)" color={darkThemeColors.foreground} onChange={(value) => setDarkThemeColors(p => ({...p, foreground: value}))} />
                                <HSLColorPicker label="Card" color={darkThemeColors.card} onChange={(value) => setDarkThemeColors(p => ({...p, card: value}))} />
                                <HSLColorPicker label="Primary" color={darkThemeColors.primary} onChange={(value) => setDarkThemeColors(p => ({...p, primary: value}))} />
                                <HSLColorPicker label="Accent" color={darkThemeColors.accent} onChange={(value) => setDarkThemeColors(p => ({...p, accent: value}))} />
                            </div>
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
