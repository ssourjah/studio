
'use client';
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppLogo } from "@/components/app-logo";
import { useSettings } from "@/context/SettingsContext";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function LoginPage() {
  const { companyName } = useSettings();
  const { toast } = useToast();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!username || !password) {
      toast({
        title: "Login Error",
        description: "Please enter both username and password.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef, 
        where("username", "==", username), 
        where("password", "==", password)
      );
      
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({
          title: "Login Failed",
          description: "Invalid username or password.",
          variant: "destructive",
        });
      } else {
        const userDoc = querySnapshot.docs[0].data();
        if (userDoc.status !== 'Active') {
             toast({
                title: "Login Failed",
                description: "Your account is not active. Please contact an administrator.",
                variant: "destructive",
            });
        } else {
            toast({
                title: "Login Successful",
                description: `Welcome back, ${userDoc.name}!`,
            });
            router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error("Authentication error: ", error);
      toast({
        title: "Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
       <AppLogo showName={false} />
       <h1 className="text-3xl font-bold font-headline">{companyName}</h1>
      <Card className="w-full max-w-sm">
        <form onSubmit={handleLogin}>
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your username below to login to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                type="text" 
                placeholder="admin" 
                required 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="/reset-password" className="ml-auto inline-block text-sm underline">
                  Forgot your password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="underline">
                Register New User?
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
