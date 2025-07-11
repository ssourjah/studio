'use client';
import { useRef, ChangeEvent, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettings } from '@/context/SettingsContext';

export default function ProfilePage() {
  const { avatarUrl, setAvatarUrl } = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePicture = () => {
    if (previewUrl) {
      setAvatarUrl(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
             <Card>
                 <CardContent className="pt-6 flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 mb-4 cursor-pointer" onClick={handleAvatarClick}>
                        <AvatarImage src={previewUrl || avatarUrl || "https://placehold.co/100x100.png"} data-ai-hint="profile picture" />
                        <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-bold">Admin User</h2>
                    <p className="text-muted-foreground">System Administrator</p>
                    <div className="flex flex-col gap-2 mt-4 w-full px-6">
                        <Button variant="outline" onClick={handleAvatarClick}>
                            Change Picture
                        </Button>
                         {previewUrl && (
                            <Button onClick={handleSavePicture}>Save Picture</Button>
                        )}
                    </div>
                    <Input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange}
                      className="hidden" 
                      accept="image/*"
                    />
                 </CardContent>
             </Card>
        </div>
        <div className="md:col-span-2">
             <Card>
                <CardHeader>
                    <CardTitle>Profile Details</CardTitle>
                    <CardDescription>Manage your personal and work information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="full-name">Full Name</Label>
                            <Input id="full-name" defaultValue="Admin User" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" defaultValue="admin" />
                        </div>
                    </div>
                     <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" defaultValue="admin@taskmaster.pro" disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" defaultValue="123-456-7890" />
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="employee-id">Employee ID</Label>
                            <Input id="employee-id" defaultValue="EMP001" disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="designation">Designation</Label>
                            <Input id="designation" defaultValue="System Administrator" />
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="department">Department</Label>
                            <Input id="department" defaultValue="IT" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="access-level">Access Level</Label>
                            <Input id="access-level" defaultValue="Admin" disabled />
                        </div>
                    </div>
                    <Button>Save Changes</Button>
                </CardContent>
             </Card>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your password for security.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                    </div>
                    <Button>Update Password</Button>
                </CardContent>
             </Card>
        </div>
    </div>
  );
}
