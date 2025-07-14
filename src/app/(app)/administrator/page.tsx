
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Trash2, ShieldQuestion, Edit, XCircle } from "lucide-react";
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
    acc[service.id] = { read: false, create: false, edit: false, delete: false };
    return acc;
}, {} as Record<PermissionLevel, Permission>);


export default function AdministratorPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState('');
  const [permissions, setPermissions] = useState<Record<PermissionLevel, Permission>>(initialPermissions);
  const { toast } = useToast();

  const isEditing = !!selectedRole;

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "roles"), (snapshot) => {
        const rolesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Role));
        setRoles(rolesData);
    });
    return () => unsubscribe();
  }, []);

  const handleSelectRoleForEdit = (role: Role) => {
    setSelectedRole(role);
    setRoleName(role.name);
    // Ensure all permission levels are present, even if not in saved data
    const fullPermissions = { ...initialPermissions, ...role.permissions };
    setPermissions(fullPermissions);
  };

  const clearSelection = () => {
    setSelectedRole(null);
    setRoleName('');
    setPermissions(initialPermissions);
  };

  const handlePermissionChange = (service: PermissionLevel, level: keyof Permission) => {
    setPermissions(prev => ({
        ...prev,
        [service]: {
            ...prev[service],
            [level]: !prev[service][level]
        }
    }));
  };

  const handleSaveRole = async () => {
    if (roleName.trim()) {
      try {
        const roleId = selectedRole ? selectedRole.id : doc(collection(db, 'roles')).id;
        const roleRef = doc(db, 'roles', roleId);
        
        await setDoc(roleRef, {
          name: roleName.trim(),
          permissions: permissions
        });

        toast({ title: "Success", description: `Role ${isEditing ? 'updated' : 'added'} successfully.` });
        clearSelection();

      } catch (error) {
        console.error("Error saving role: ", error);
        toast({ title: "Error", description: `Could not ${isEditing ? 'update' : 'add'} role.`, variant: "destructive" });
      }
    }
  };
  
  const handleDeleteRole = async (id: string) => {
    try {
        await deleteDoc(doc(db, "roles", id));
        toast({ title: "Success", description: "Role deleted successfully." });
        if (selectedRole?.id === id) {
            clearSelection();
        }
    } catch (error) {
        toast({ title: "Error", description: "Could not delete role.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6" suppressHydrationWarning>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{isEditing ? `Editing Role: ${selectedRole.name}` : 'Create New Role'}</CardTitle>
              <CardDescription>{isEditing ? 'Modify the permissions for this role.' : 'Define a new user role and set its permissions.'}</CardDescription>
            </div>
             {isEditing && (
                <Button variant="outline" size="sm" onClick={clearSelection}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel Edit
                </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="role-name">Role Name</Label>
                <Input 
                    id="role-name" 
                    placeholder="e.g., Field Manager"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
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
                                    <TableHead className="text-center">Create</TableHead>
                                    <TableHead className="text-center">Edit</TableHead>
                                    <TableHead className="text-center">Delete</TableHead>
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
                                        {(['read', 'create', 'edit', 'delete'] as const).map(level => (
                                            <TableCell key={level} className="text-center">
                                                <Checkbox
                                                    checked={permissions[service.id]?.[level] || false}
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

            <Button onClick={handleSaveRole} disabled={!roleName}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {isEditing ? 'Save Changes' : 'Add Role'}
            </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Existing Roles</CardTitle>
            <CardDescription>A list of all roles. Click a role to edit it.</CardDescription>
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
                            <TableRow key={role.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleSelectRoleForEdit(role)}>
                                <TableCell className="font-medium">{role.name}</TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); handleSelectRoleForEdit(role); }}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <AlertDialog onOpenChange={(open) => !open && clearSelection()}>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={(e) => e.stopPropagation()}>
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
