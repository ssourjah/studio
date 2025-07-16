
'use client';
import { useState, useEffect, ChangeEvent } from 'react';
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
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSettings } from '@/context/SettingsContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { testSmtpConnection } from '@/ai/flows/test-smtp-flow';

const services: { id: PermissionLevel; name: string; description: string }[] = [
    { id: 'dashboard', name: 'Dashboard', description: 'View summary cards and charts.' },
    { id: 'tasks', name: 'Tasks', description: 'Create and view assigned tasks.' },
    { id: 'taskManagement', name: 'Task Management', description: 'Manage all tasks across the system.' },
    { id: 'userManagement', name: 'User Management', description: 'Manage users, roles, and permissions.' },
    { id: 'reports', name: 'Task Reports', description: 'View and export task reports.' },
    { id: 'administrator', name: 'Role Management', description: 'Create and manage user roles.' },
    { id: 'settings', name: 'Application Settings', description: 'Manage application-wide settings like branding and email.' },
];

const initialPermissions = services.reduce((acc, service) => {
    acc[service.id] = { read: false, create: false, edit: false, delete: false };
    return acc;
}, {} as Record<PermissionLevel, Permission>);


function RoleManagementTab() {
  const { userRole } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState('');
  const [permissions, setPermissions] = useState<Record<PermissionLevel, Permission>>(initialPermissions);
  const { toast } = useToast();

  const isEditing = !!selectedRole;

  const canCreate = userRole?.permissions.administrator?.create ?? false;
  const canEdit = userRole?.permissions.administrator?.edit ?? false;
  const canDelete = userRole?.permissions.administrator?.delete ?? false;

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
    const isChecked = !permissions[service][level];
    
    setPermissions(prev => {
        const newPermissions = { ...prev };
        const servicePermissions = { ...newPermissions[service] };
        
        servicePermissions[level] = isChecked;

        // If 'read' is unchecked, uncheck and disable all other permissions for that service
        if (level === 'read' && !isChecked) {
            servicePermissions.create = false;
            servicePermissions.edit = false;
            servicePermissions.delete = false;
        }

        newPermissions[service] = servicePermissions;
        return newPermissions;
    });
  };

  const handleSaveRole = async () => {
    const hasPermission = isEditing ? canEdit : canCreate;
    if (!hasPermission) {
        toast({ title: "Permission Denied", description: "You cannot save roles.", variant: "destructive" });
        return;
    }
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
    if (!canDelete) {
        toast({ title: "Permission Denied", description: "You cannot delete roles.", variant: "destructive" });
        return;
    }
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
    <div className="space-y-6">
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
                                {services.map(service => {
                                    const canRead = permissions[service.id]?.read || false;
                                    return (
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
                                            <TableCell className="text-center">
                                                <Checkbox
                                                    checked={canRead}
                                                    onCheckedChange={() => handlePermissionChange(service.id, 'read')}
                                                />
                                            </TableCell>
                                            {(['create', 'edit', 'delete'] as const).map(level => (
                                                <TableCell key={level} className="text-center">
                                                    <Checkbox
                                                        checked={permissions[service.id]?.[level] || false}
                                                        onCheckedChange={() => handlePermissionChange(service.id, level)}
                                                        disabled={!canRead}
                                                    />
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </TooltipProvider>
                </div>
            </div>

            <Button onClick={handleSaveRole} disabled={!roleName || (isEditing ? !canEdit : !canCreate)}>
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
                                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); handleSelectRoleForEdit(role); }} disabled={!canEdit}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <AlertDialog onOpenChange={(open) => !open && clearSelection()}>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={(e) => e.stopPropagation()} disabled={!canDelete}>
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
  )
}

function AppSettingsTab() {
  const { 
    companyName, setCompanyName, 
    logoUrlLight, setLogoUrlLight,
    logoUrlDark, setLogoUrlDark,
    disableAdminLogin, setDisableAdminLogin, 
    smtpSettings, setSmtpSettings,
    loading 
  } = useSettings();
  const { toast } = useToast();
  const { userRole } = useAuth();

  const [localCompanyName, setLocalCompanyName] = useState('');
  const [previewLogoUrlLight, setPreviewLogoUrlLight] = useState<string | null>(null);
  const [previewLogoUrlDark, setPreviewLogoUrlDark] = useState<string | null>(null);
  const [localDisableAdminLogin, setLocalDisableAdminLogin] = useState(false);
  const [localSmtpSettings, setLocalSmtpSettings] = useState({
    smtpHost: '',
    smtpPort: '',
    smtpUser: '',
    smtpPassword: '',
  });

  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [isSavingAdmin, setIsSavingAdmin] = useState(false);

  const canEditSettings = userRole?.permissions.settings?.edit ?? false;
  const anySaving = isSavingCompany || isSavingSmtp || isSavingAdmin || isTestingSmtp;

  useEffect(() => {
    if (!loading) {
      setLocalCompanyName(companyName);
      setPreviewLogoUrlLight(logoUrlLight);
      setPreviewLogoUrlDark(logoUrlDark);
      setLocalDisableAdminLogin(disableAdminLogin);
      setLocalSmtpSettings(smtpSettings);
    }
  }, [companyName, logoUrlLight, logoUrlDark, disableAdminLogin, smtpSettings, loading]);

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>, theme: 'light' | 'dark') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (theme === 'light') {
            setPreviewLogoUrlLight(reader.result as string);
        } else {
            setPreviewLogoUrlDark(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  const handleCompanyInfoSave = async () => {
    setIsSavingCompany(true);
    try {
      await setCompanyName(localCompanyName);
      await setLogoUrlLight(previewLogoUrlLight);
      await setLogoUrlDark(previewLogoUrlDark);
      toast({
        title: "Settings Saved",
        description: "Your company information has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to save settings:", error);
    } finally {
      setIsSavingCompany(false);
    }
  };

  const handleSmtpSave = async () => {
    setIsSavingSmtp(true);
    try {
        await setSmtpSettings(localSmtpSettings);
        toast({
            title: "SMTP Settings Saved",
            description: "Your email server settings have been updated.",
        });
    } catch (error) {
        toast({
            title: "Error",
            description: "Failed to save SMTP settings. Please try again.",
            variant: "destructive",
        });
    } finally {
        setIsSavingSmtp(false);
    }
  };

  const handleSmtpTest = async () => {
    setIsTestingSmtp(true);
    try {
        await testSmtpConnection(localSmtpSettings);
        toast({
            title: "Connection Successful",
            description: "The SMTP server is configured correctly.",
        });
    } catch (error: any) {
        console.error("SMTP Test Error:", error);
        toast({
            title: "Connection Failed",
            description: error.message || "Could not connect to the SMTP server. Please check the details and try again.",
            variant: "destructive",
        });
    } finally {
        setIsTestingSmtp(false);
    }
  };

  const handleAdminSettingsSave = async () => {
    setIsSavingAdmin(true);
    try {
        await setDisableAdminLogin(localDisableAdminLogin);
        toast({
            title: "Admin Settings Saved",
            description: "Your administrator settings have been updated.",
        });
    } catch (error) {
        toast({
            title: "Error",
            description: "Failed to save admin settings. Please try again.",
            variant: "destructive",
        });
    } finally {
        setIsSavingAdmin(false);
    }
  };
  
  if (loading) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                     <Skeleton className="h-10 w-36" />
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                     <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-4">
                     <Skeleton className="h-10 w-full" />
                     <Skeleton className="h-10 w-36" />
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>Update your company's details and branding.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <fieldset disabled={!canEditSettings || anySaving}>
                <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input id="company-name" value={localCompanyName} onChange={(e) => setLocalCompanyName(e.target.value)} />
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="company-logo-light">Light Theme Logo</Label>
                        <Input id="company-logo-light" type="file" onChange={(e) => handleLogoUpload(e, 'light')} accept="image/*" />
                        <p className="text-sm text-muted-foreground">Best on light backgrounds. Transparent PNGs recommended.</p>
                        {previewLogoUrlLight && (
                          <div className="mt-4">
                            <p className="text-sm font-medium">Preview:</p>
                            <img src={previewLogoUrlLight} alt="Light Theme Logo Preview" className="h-16 w-auto mt-2 rounded-md border p-2 bg-muted" />
                          </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="company-logo-dark">Dark Theme Logo</Label>
                        <Input id="company-logo-dark" type="file" onChange={(e) => handleLogoUpload(e, 'dark')} accept="image/*" />
                        <p className="text-sm text-muted-foreground">Best on dark backgrounds. Transparent PNGs recommended.</p>
                        {previewLogoUrlDark && (
                          <div className="mt-4">
                            <p className="text-sm font-medium">Preview:</p>
                            <img src={previewLogoUrlDark} alt="Dark Theme Logo Preview" className="h-16 w-auto mt-2 rounded-md border p-2 bg-card" />
                          </div>
                        )}
                    </div>
                </div>
                
                <Button onClick={handleCompanyInfoSave} disabled={isSavingCompany || !canEditSettings} className="mt-6">
                  {isSavingCompany ? 'Saving...' : 'Save Company Info'}
                </Button>
            </fieldset>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Server (SMTP)</CardTitle>
          <CardDescription>Configure your outgoing email server to send registration invites.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <fieldset disabled={!canEditSettings || anySaving}>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="smtp-host">SMTP Host</Label>
                        <Input id="smtp-host" placeholder="smtp.example.com" value={localSmtpSettings.smtpHost} onChange={(e) => setLocalSmtpSettings(p => ({...p, smtpHost: e.target.value}))} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="smtp-port">SMTP Port</Label>
                        <Input id="smtp-port" placeholder="587" value={localSmtpSettings.smtpPort} onChange={(e) => setLocalSmtpSettings(p => ({...p, smtpPort: e.target.value}))} />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="smtp-user">Username</Label>
                    <Input id="smtp-user" placeholder="user@example.com" value={localSmtpSettings.smtpUser} onChange={(e) => setLocalSmtpSettings(p => ({...p, smtpUser: e.target.value}))} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="smtp-password">Password</Label>
                    <Input id="smtp-password" type="password" value={localSmtpSettings.smtpPassword} onChange={(e) => setLocalSmtpSettings(p => ({...p, smtpPassword: e.target.value}))} />
                </div>
                <div className="flex gap-2 mt-4">
                    <Button onClick={handleSmtpSave} disabled={isSavingSmtp || !canEditSettings}>{isSavingSmtp ? 'Saving...' : 'Save SMTP Settings'}</Button>
                    <Button onClick={handleSmtpTest} variant="outline" disabled={isTestingSmtp || !canEditSettings}>{isTestingSmtp ? 'Testing...' : 'Test Connection'}</Button>
                </div>
            </fieldset>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Admin Credentials</CardTitle>
          <CardDescription>Manage administrator account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <fieldset disabled={!canEditSettings || anySaving}>
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label htmlFor="disable-admin" className="text-base">Disable Default Admin</Label>
                        <p className="text-sm text-muted-foreground">
                            Disable the default 'admin@taskmaster.pro' user login.
                        </p>
                    </div>
                    <Switch
                        id="disable-admin"
                        checked={localDisableAdminLogin}
                        onCheckedChange={setLocalDisableAdminLogin}
                    />
                </div>
                 <Button onClick={handleAdminSettingsSave} disabled={isSavingAdmin || !canEditSettings} className="mt-4">
                    {isSavingAdmin ? 'Saving...' : 'Save Admin Settings'}
                 </Button>
            </fieldset>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdministratorPage() {
    const { userRole } = useAuth();
    const canReadRoles = userRole?.permissions.administrator?.read ?? false;
    const canReadSettings = userRole?.permissions.settings?.read ?? false;

  return (
    <Tabs defaultValue={canReadRoles ? "roles" : "settings"} className="space-y-4">
        <TabsList>
            {canReadRoles && <TabsTrigger value="roles">Role Management</TabsTrigger>}
            {canReadSettings && <TabsTrigger value="settings">Application Settings</TabsTrigger>}
        </TabsList>
        {canReadRoles && (
            <TabsContent value="roles">
                <RoleManagementTab />
            </TabsContent>
        )}
        {canReadSettings && (
            <TabsContent value="settings">
                <AppSettingsTab />
            </TabsContent>
        )}
    </Tabs>
  );
}
