'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, UserPlus, Mail } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function InviteUserPage() {
  return (
    <div className="space-y-6">
        <div>
            <Button variant="outline" asChild>
                <Link href="/user-management">
                    <ArrowLeft />
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
            <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="full-name">Full Name</Label>
                        <Input id="full-name" placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" placeholder="johndoe" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email-register">Email</Label>
                    <Input id="email-register" type="email" placeholder="user@company.com" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="role-register">Role</Label>
                    <Select>
                        <SelectTrigger id="role-register">
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="administrator">Administrator</SelectItem>
                            <SelectItem value="technician">Technician</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button>
                    <UserPlus />
                    Create User Account
                </Button>
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
                    <Label htmlFor="role-invite">Role</Label>
                    <Select>
                        <SelectTrigger id="role-invite">
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="administrator">Administrator</SelectItem>
                            <SelectItem value="technician">Technician</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button>
                    <Mail />
                    Send Invitation
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
