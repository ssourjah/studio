

'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, UserPlus, Mail } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { accessLevels } from "@/lib/mock-data";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const userSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  employeeId: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  accessLevel: z.string().min(1, "Access level is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function InviteUserPage() {
  const { toast } = useToast();
  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema)
  });

  const onRegisterSubmit = async (data: z.infer<typeof userSchema>) => {
    try {
      // Step 1: Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // Step 2: Create the user document in Firestore, using the UID from Auth as the document ID
      await setDoc(doc(db, "users", user.uid), {
        id: user.uid, // Explicitly linking the document to the auth user
        name: data.name,
        username: data.username,
        email: data.email,
        phone: data.phone || '',
        employeeId: data.employeeId || '',
        department: data.department || '',
        designation: data.designation || '',
        accessLevel: data.accessLevel,
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

  const onInviteSubmit = (data: any) => {
    console.log("Invite data:", data);
    toast({ title: "Invitation Sent", description: `An invitation has been sent to ${data.inviteEmail}.` });
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
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="designation">Designation</Label>
                            <Input id="designation" placeholder="e.g., Technician" {...register("designation")} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="access-level-register">Access Level</Label>
                            <Controller
                                name="accessLevel"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger id="access-level-register">
                                            <SelectValue placeholder="Select an access level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accessLevels.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.accessLevel && <p className="text-red-500 text-sm">{errors.accessLevel.message as string}</p>}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" {...register("password")} />
                        {errors.password && <p className="text-red-500 text-sm">{errors.password.message as string}</p>}
                    </div>
                    <Button type="submit" disabled={isSubmitting}>
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
            <CardContent className="space-y-4">
                 <div className="grid md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="invite-name">Full Name</Label>
                        <Input id="invite-name" placeholder="Jane Doe" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="invite-email">Email Address</Label>
                        <Input id="invite-email" type="email" placeholder="new.user@company.com" />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="access-level-invite">Access Level</Label>
                    <Select>
                        <SelectTrigger id="access-level-invite">
                            <SelectValue placeholder="Select an access level" />
                        </SelectTrigger>
                        <SelectContent>
                             {accessLevels.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleSubmit(onInviteSubmit)}>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Invitation
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
