
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Trash2, ShieldQuestion } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { Role, Permission, PermissionLevel } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { db } from '@/lib/firebase';
import { collection, setDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const services: { id: PermissionLevel; name: string; description: string }[] = [
    { id: 'dashboard', name: 'Dashboard', description: 'View summary cards and charts.' },
    { id: 'tasks', name: 'Tasks', description: 'Create and view assigned tasks.' },
    { id: 'taskManagement', name: 'Task Management', description: 'Manage all tasks across the system.' },
    { id: 'userManagement', name: 'User Management', description: 'Manage users, roles, and permissions.' },
    { id: 'reports', name: 'Task Reports', description: 'View and export task reports.' },
    { id: 'settings', name: 'Settings', description: 'Configure application-wide settings.' },
    { id: 'administrator', name: 'Role Management', description: 'Create and manage user roles (this page).' },
];

const initialPermissions = services.reduce((acc, service) => {
    acc[service.id] = { read: false, write: false, admin: false };
    return acc;
}, {} as Record<PermissionLevel, Permission>);


export default function AdministratorPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [newRoleName, setNewRoleName] = useState('');
  const [permissions, setPermissions] = useState<Record<PermissionLevel, Permission>>(initialPermissions);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "roles"), (snapshot) => {
        const rolesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Role));
        setRoles(rolesData);
    });
    return () => unsubscribe();
  }, []);

  const handlePermissionChange = (service: PermissionLevel, level: keyof Permission) => {
    setPermissions(prev => ({
        ...prev,
        [service]: {
            ...prev[service],
            [level]: !prev[service][level]
        }
    }));
  };

  const handleAddRole = async () => {
    if (newRoleName.trim()) {
      try {
        const newRoleRef = doc(collection(db, 'roles'));
        await setDoc(newRoleRef, {
          name: newRoleName.trim(),
          permissions: permissions
        });
        toast({ title: "Success", description: "Role added successfully." });
        setNewRoleName('');
        setPermissions(initialPermissions);
      } catch (error) {
        console.error("Error adding role: ", error);
        toast({ title: "Error", description: "Could not add role.", variant: "destructive" });
      }
    }
  };
  
  const handleDeleteRole = async (id: string) => {
    try {
        await deleteDoc(doc(db, "roles", id));
        toast({ title: "Success", description: "Role deleted successfully." });
    } catch (error) {
        toast({ title: "Error", description: "Could not delete role.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6" suppressHydrationWarning>
      <Card>
        <CardHeader>
          <CardTitle>Create New Role</CardTitle>
          <CardDescription>Define a new user role and set its permissions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="role-name">Role Name</Label>
                <Input 
                    id="role-name" 
                    placeholder="e.g., Field Manager"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                />
            </div>
            
            <div className="space-y-4">
                <Label>Permissions</Label>
                <div className="border rounded-md">
                    <TooltipProvider>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Service</TableHead>
                                    <TableHead className="text-center">Read</TableHead>
                                    <TableHead className="text-center">Write</TableHead>
                                    <TableHead className="text-center">Admin</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {services.map(service => (
                                    <TableRow key={service.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <span>{service.name}</span>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <ShieldQuestion className="h-4 w-4 text-muted-foreground" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{service.description}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TableCell>
                                        {(['read', 'write', 'admin'] as const).map(level => (
                                            <TableCell key={level} className="text-center">
                                                <Checkbox
                                                    checked={permissions[service.id][level]}
                                                    onCheckedChange={() => handlePermissionChange(service.id, level)}
                                                />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TooltipProvider>
                </div>
            </div>

            <Button onClick={handleAddRole} disabled={!newRoleName}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Role
            </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Existing Roles</CardTitle>
            <CardDescription>A list of all roles. Users with these roles will gain the permissions you've set.</CardDescription>
        </CardHeader>
        <CardContent>
             <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Role Name</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {roles.map((role) => (
                            <TableRow key={role.id}>
                                <TableCell className="font-medium">{role.name}</TableCell>
                                <TableCell className="text-right">
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                                          <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This action cannot be undone. This will permanently delete the <strong>{role.name}</strong> role. Any users assigned to this role will lose their permissions.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteRole(role.id)} className="bg-destructive hover:bg-destructive/90">
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                         {roles.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={2} className="text-center text-muted-foreground">
                                    No roles found. Create one above to get started.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
