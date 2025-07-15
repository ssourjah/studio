
'use client';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AppLogo } from "@/components/app-logo";
import { useSettings } from "@/context/SettingsContext";

const registerSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  employeeId: z.string().optional(),
  department: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password confirmation is required"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export default function RegisterPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleId = searchParams.get('roleId');
  const { companyName } = useSettings();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    setIsSubmitting(true);
    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // 2. Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        name: data.fullName,
        username: data.username,
        email: data.email,
        phone: data.phone || '',
        employeeId: data.employeeId || '',
        department: data.department || '',
        roleId: roleId || null, // Use roleId from invite link or null
        status: 'Active', // Users registering via link are auto-activated
      });
      
      toast({
        title: "Registration Successful",
        description: "Your account has been created successfully.",
      });
      router.push("/login");

    } catch (error: any) {
      let description = "An unexpected error occurred. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
        description = "This email address is already registered.";
      }
      toast({
        title: "Registration Failed",
        description,
        variant: "destructive",
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
       <div className="flex flex-col items-center gap-3">
          <AppLogo showName={false} />
          <h1 className="text-3xl font-bold font-headline">{companyName}</h1>
       </div>
      <Card className="w-full max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="text-2xl">Register New User</CardTitle>
            <CardDescription>
              {roleId 
                ? "You've been invited! Please complete the form to create your account."
                : "Fill in the form to request a new user account. Your request will be sent for admin approval."
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                      <Label htmlFor="full-name">Full Name</Label>
                      <Input id="full-name" placeholder="Your Name" {...register("fullName")} />
                      {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
                  </div>
                  <div className="grid gap-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" placeholder="your_username" {...register("username")} />
                      {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
                  </div>
              </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="m@example.com" {...register("email")} />
                      {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                  </div>
                   <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" placeholder="123-456-7890" {...register("phone")} />
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                      <Label htmlFor="employee-id">Employee ID</Label>
                      <Input id="employee-id" placeholder="EMP12345" {...register("employeeId")} />
                  </div>
                  <div className="grid gap-2">
                      <Label htmlFor="department">Department</Label>
                      <Input id="department" placeholder="e.g. Field Services" {...register("department")} />
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                   <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" {...register("password")} />
                      {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                  </div>
                  <div className="grid gap-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
                      {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
                  </div>
              </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Create My Account'}
            </Button>
             <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

  
