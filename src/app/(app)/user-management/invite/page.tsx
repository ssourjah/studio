
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, UserPlus, Mail } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller, useForm as useInviteForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc, collection, onSnapshot } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import type { Role } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { sendInvite } from '@/services/email';
import { useSettings } from "@/context/SettingsContext";

const userSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  employeeId: z.string().optional(),
  department: z.string().optional(),
  roleId: z.string().min(1, "A role is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password confirmation is required"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

const inviteSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  roleId: z.string().min(1, "A role is required"),
});

export default function InviteUserPage() {
  const { toast } = useToast();
  const { userRole } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema)
  });

  const {
      control: inviteControl,
      register: inviteRegister,
      handleSubmit: handleInviteSubmit,
      reset: inviteReset,
      formState: { errors: inviteErrors, isSubmitting: isInviting }
  } = useInviteForm<z.infer<typeof inviteSchema>>({
      resolver: zodResolver(inviteSchema)
  });
  
  const canCreateUsers = userRole?.permissions.userManagement?.create ?? false;

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "roles"), (snapshot) => {
      const rolesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Role));
      setRoles(rolesData);
    });
    return () => unsubscribe();
  }, []);

  const onRegisterSubmit = async (data: z.infer<typeof userSchema>) => {
    if (!canCreateUsers) {
        toast({ title: "Permission Denied", description: "You are not authorized to create users.", variant: "destructive" });
        return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        name: data.name,
        username: data.username,
        email: data.email,
        phone: data.phone || '',
        employeeId: data.employeeId || '',
        department: data.department || '',
        roleId: data.roleId,
        status: 'Active'
      });

      toast({ title: "User Created", description: "The new user has been registered." });
      reset();

    } catch (e: any) {
      let description = "Failed to create user.";
      if (e.code === 'auth/email-already-in-use') {
        description = "This email is already in use by another account.";
      }
      console.error("Error adding document: ", e);
      toast({ title: "Error", description, variant: "destructive" });
    }
  };

  const onInviteSubmit = async (data: z.infer<typeof inviteSchema>) => {
    if (!canCreateUsers) {
        toast({ title: "Permission Denied", description: "You cannot send invites.", variant: "destructive" });
        return;
    }
    try {
        await sendInvite({
            name: data.name,
            email: data.email,
            roleId: data.roleId,
        });
        toast({ title: "Invitation Sent", description: `An invitation has been sent to ${data.email}.` });
        inviteReset();
    } catch (error: any) {
        console.error("Error sending invite:", error);
        toast({ title: "Error", description: error.message || "Could not send invitation. Please check SMTP settings.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
        <div>
            <Button variant="outline" asChild>
                <Link href="/user-management">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to User Management
                </Link>
            </Button>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Register New User</CardTitle>
                <CardDescription>
                    Manually create a new user account. An email will not be sent.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="full-name">Full Name</Label>
                            <Input id="full-name" placeholder="John Doe" {...register("name")} />
                            {errors.name && <p className="text-red-500 text-sm">{errors.name.message as string}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" placeholder="johndoe" {...register("username")} />
                             {errors.username && <p className="text-red-500 text-sm">{errors.username.message as string}</p>}
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email-register">Email</Label>
                            <Input id="email-register" type="email" placeholder="user@company.com" {...register("email")} />
                             {errors.email && <p className="text-red-500 text-sm">{errors.email.message as string}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" placeholder="123-456-7890" {...register("phone")} />
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="employee-id">Employee ID</Label>
                            <Input id="employee-id" placeholder="EMP123" {...register("employeeId")} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="department">Department</Label>
                            <Input id="department" placeholder="e.g., Field Services" {...register("department")} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Controller
                            name="roleId"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger id="role">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.roleId && <p className="text-red-500 text-sm">{errors.roleId.message as string}</p>}
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label htmlFor="password">Password</Label>
                           <Input id="password" type="password" {...register("password")} />
                           {errors.password && <p className="text-red-500 text-sm">{errors.password.message as string}</p>}
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="confirmPassword">Confirm Password</Label>
                           <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
                           {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message as string}</p>}
                        </div>
                    </div>
                    
                    <Button type="submit" disabled={isSubmitting || !canCreateUsers}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        {isSubmitting ? 'Creating...' : 'Create User Account'}
                    </Button>
                </form>
            </CardContent>
        </Card>
        
        <div className="relative">
            <Separator />
            <div className="absolute left-1/2 -translate-x-1/2 -top-3 bg-muted px-2 text-sm text-muted-foreground">
                OR
            </div>
        </div>

        <Card>
             <CardHeader>
                <CardTitle>Invite New User via Email</CardTitle>
                <CardDescription>
                    Send an invitation link for a new user to register themselves.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <form onSubmit={handleInviteSubmit(onInviteSubmit)} className="space-y-4">
                     <div className="grid md:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="invite-name">Full Name</Label>
                            <Input id="invite-name" placeholder="Jane Doe" {...inviteRegister("name")} />
                            {inviteErrors.name && <p className="text-red-500 text-sm">{inviteErrors.name.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="invite-email">Email Address</Label>
                            <Input id="invite-email" type="email" placeholder="new.user@company.com" {...inviteRegister("email")} />
                             {inviteErrors.email && <p className="text-red-500 text-sm">{inviteErrors.email.message}</p>}
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="invite-role">Role</Label>
                         <Controller
                             name="roleId"
                             control={inviteControl}
                             render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger id="invite-role">
                                        <SelectValue placeholder="Select a role for the invitee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                             )}
                         />
                         {inviteErrors.roleId && <p className="text-red-500 text-sm">{inviteErrors.roleId.message}</p>}
                    </div>
                    <Button type="submit" disabled={isInviting || !canCreateUsers}>
                        <Mail className="mr-2 h-4 w-4" />
                        {isInviting ? 'Sending...' : 'Send Invitation'}
                    </Button>
                 </form>
            </CardContent>
        </Card>
    </div>
  );
}
