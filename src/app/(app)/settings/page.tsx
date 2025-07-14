
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/context/SettingsContext";
import { ChangeEvent, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const { 
    companyName, setCompanyName, 
    logoUrl, setLogoUrl, 
    disableAdminLogin, setDisableAdminLogin, 
    loading 
  } = useSettings();
  const { toast } = useToast();

  const [localCompanyName, setLocalCompanyName] = useState('');
  const [previewLogoUrl, setPreviewLogoUrl] = useState<string | null>(null);
  const [localDisableAdminLogin, setLocalDisableAdminLogin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading) {
      setLocalCompanyName(companyName);
      setPreviewLogoUrl(logoUrl);
      setLocalDisableAdminLogin(disableAdminLogin);
    }
  }, [companyName, logoUrl, disableAdminLogin, loading]);

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await setCompanyName(localCompanyName);
      await setLogoUrl(previewLogoUrl);
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
      setIsSaving(false);
    }
  };

  const handleAdminSettingsSave = async () => {
    setIsSaving(true);
    try {
        await setDisableAdminLogin(localDisableAdminLogin);
        toast({
            title: "Admin Settings Saved",
            description: "Your administrator settings have been updated.",
        });
    } catch (error) {
        toast({
            title: "Error",
            description: "Failed to save admin settings.",
            variant: "destructive",
        });
    } finally {
        setIsSaving(false);
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
          <CardDescription>Update your company's details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input id="company-name" value={localCompanyName} onChange={(e) => setLocalCompanyName(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="company-logo">Company Logo</Label>
                <Input id="company-logo" type="file" onChange={handleLogoUpload} accept="image/*" />
                <p className="text-sm text-muted-foreground">Upload a new logo for your company.</p>
                {previewLogoUrl && (
                  <div className="mt-4">
                    <p className="text-sm font-medium">Logo Preview:</p>
                    <img src={previewLogoUrl} alt="Company Logo Preview" className="h-16 w-auto mt-2 rounded-md border p-2 bg-muted" />
                  </div>
                )}
            </div>
            <Button onClick={handleSaveChanges} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Company Info'}
            </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Server (SMTP)</CardTitle>
          <CardDescription>Configure your outgoing email server to send registration invites.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="smtp-host">SMTP Host</Label>
                    <Input id="smtp-host" placeholder="smtp.example.com" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="smtp-port">SMTP Port</Label>
                    <Input id="smtp-port" placeholder="587" />
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="smtp-user">Username</Label>
                <Input id="smtp-user" placeholder="user@example.com" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="smtp-password">Password</Label>
                <Input id="smtp-password" type="password" />
            </div>
            <div className="flex gap-2">
                <Button>Save SMTP Settings</Button>
                <Button variant="outline">Test Connection</Button>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Admin Credentials</CardTitle>
          <CardDescription>Manage administrator account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
             <Button onClick={handleAdminSettingsSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Admin Settings'}
             </Button>
        </CardContent>
      </Card>
    </div>
  );
}
