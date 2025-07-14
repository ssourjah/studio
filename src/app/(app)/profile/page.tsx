
'use client';
import { useRef, ChangeEvent, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { currentUser, setCurrentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

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

  const handleSavePicture = async () => {
    if (previewUrl && currentUser) {
      const userDocRef = doc(db, 'users', currentUser.id);
      try {
        await updateDoc(userDocRef, { avatarUrl: previewUrl });
        const updatedUser = { ...currentUser, avatarUrl: previewUrl };
        setCurrentUser(updatedUser);
        setPreviewUrl(null);
        toast({
          title: "Avatar Updated",
          description: "Your new profile picture has been saved.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save your new picture.",
          variant: "destructive",
        });
      }
    }
  };
  
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  
  if (!currentUser) {
    return (
        <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1">
                <Card><CardContent className="pt-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
            </div>
            <div className="md:col-span-2">
                <Card><CardContent className="pt-6"><Skeleton className="h-96 w-full" /></CardContent></Card>
                 <Card className="mt-6"><CardContent className="pt-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
            </div>
        </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
             <Card>
                 <CardContent className="pt-6 flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 mb-4 cursor-pointer" onClick={handleAvatarClick}>
                        <AvatarImage src={previewUrl || currentUser.avatarUrl || "https://placehold.co/100x100.png"} data-ai-hint="profile picture" />
                        <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-bold">{currentUser.name}</h2>
                    <p className="text-muted-foreground">{currentUser.roleId || 'N/A'}</p>
                    <div className="flex flex-col gap-2 mt-4 w-full px-6">
                        <Button variant="outline" onClick={handleAvatarClick} suppressHydrationWarning>
                            Change Picture
                        </Button>
                         {previewUrl && (
                            <Button onClick={handleSavePicture} suppressHydrationWarning>Save Picture</Button>
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
                            <Input id="full-name" defaultValue={currentUser.name} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" defaultValue={currentUser.username} />
                        </div>
                    </div>
                     <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" defaultValue={currentUser.email} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" defaultValue={currentUser.phone} />
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="employee-id">Employee ID</Label>
                            <Input id="employee-id" defaultValue={currentUser.employeeId} disabled />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="department">Department</Label>
                            <Input id="department" defaultValue={currentUser.department} />
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Input id="role" defaultValue={currentUser.roleId} disabled />
                        </div>
                    </div>
                    <Button suppressHydrationWarning>Save Changes</Button>
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
                    <Button suppressHydrationWarning>Update Password</Button>
                </CardContent>
             </Card>
        </div>
    </div>
  );
}
