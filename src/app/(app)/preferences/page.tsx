
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ThemePreference, FontSizePreference } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Sun, Moon, Laptop, Type } from 'lucide-react';

export default function PreferencesPage() {
    const { currentUser, setCurrentUser } = useAuth();
    const { toast } = useToast();
    const [selectedTheme, setSelectedTheme] = useState<ThemePreference>('system');
    const [selectedFontSize, setSelectedFontSize] = useState<FontSizePreference>('base');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (currentUser?.preferences?.theme) {
            setSelectedTheme(currentUser.preferences.theme);
        }
        if (currentUser?.preferences?.fontSize) {
            setSelectedFontSize(currentUser.preferences.fontSize);
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
            const newPreferences = { 
                ...currentUser.preferences, 
                theme: selectedTheme,
                fontSize: selectedFontSize,
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

                     <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Preferences'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
