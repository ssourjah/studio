
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
import { db, auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your new password"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match",
  path: ["confirmPassword"],
});

export default function ProfilePage() {
  const { currentUser, setCurrentUser, userRole } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema)
  });

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

  const onPasswordChangeSubmit = async (data: z.infer<typeof passwordSchema>) => {
    const user = auth.currentUser;
    if (!user || !user.email) {
      toast({ title: "Error", description: "Could not find user to update.", variant: "destructive" });
      return;
    }

    const credential = EmailAuthProvider.credential(user.email, data.currentPassword);
    
    try {
      // Step 1: Re-authenticate the user
      await reauthenticateWithCredential(user, credential);

      // Step 2: If re-authentication is successful, update the password
      await updatePassword(user, data.newPassword);

      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });
      reset();

    } catch (error: any) {
        let description = "An unexpected error occurred.";
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            description = "The current password you entered is incorrect.";
        }
        console.error("Password update error:", error);
        toast({
            title: "Password Update Failed",
            description,
            variant: "destructive"
        });
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
                    <p className="text-muted-foreground">{userRole?.name || 'N/A'}</p>
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
                            <Input id="role" value={userRole?.name || 'N/A'} disabled />
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
                <CardContent>
                    <form onSubmit={handleSubmit(onPasswordChangeSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input id="current-password" type="password" {...register("currentPassword")} />
                            {errors.currentPassword && <p className="text-sm text-red-500">{errors.currentPassword.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input id="new-password" type="password" {...register("newPassword")} />
                             {errors.newPassword && <p className="text-sm text-red-500">{errors.newPassword.message}</p>}
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input id="confirm-password" type="password" {...register("confirmPassword")} />
                             {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
                        </div>
                        <Button type="submit" disabled={isSubmitting}>Update Password</Button>
                    </form>
                </CardContent>
             </Card>
        </div>
    </div>
  );
}

    