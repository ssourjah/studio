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

export default function InviteUserPage() {
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
                 <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="email-register">Email</Label>
                        <Input id="email-register" type="email" placeholder="user@company.com" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" placeholder="123-456-7890" />
                    </div>
                </div>
                 <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="employee-id">Employee ID</Label>
                        <Input id="employee-id" placeholder="EMP123" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input id="department" placeholder="e.g., Field Services" />
                    </div>
                </div>
                 <div className="grid md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="designation">Designation</Label>
                        <Input id="designation" placeholder="e.g., Technician" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="access-level-register">Access Level</Label>
                        <Select>
                            <SelectTrigger id="access-level-register">
                                <SelectValue placeholder="Select an access level" />
                            </SelectTrigger>
                            <SelectContent>
                                {accessLevels.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" />
                </div>
                <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
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
                <Button>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Invitation
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
