
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
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const { 
    companyName, setCompanyName, 
    logoUrlLight, setLogoUrlLight,
    logoUrlDark, setLogoUrlDark,
    disableAdminLogin, setDisableAdminLogin, 
    smtpSettings, setSmtpSettings,
    loading 
  } = useSettings();
  const { toast } = useToast();

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

  const [isSaving, setIsSaving] = useState(false);

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
    setIsSaving(true);
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
      setIsSaving(false);
    }
  };

  const handleSmtpSave = async () => {
    setIsSaving(true);
    try {
        await setSmtpSettings(localSmtpSettings);
        toast({
            title: "SMTP Settings Saved",
            description: "Your email server settings have been updated.",
        });
    } catch (error) {
        toast({
            title: "Error",
            description: "Failed to save SMTP settings.",
            variant: "destructive",
        });
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
          <CardDescription>Update your company's details and branding.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input id="company-name" value={localCompanyName} onChange={(e) => setLocalCompanyName(e.target.value)} />
            </div>

            <Separator />

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
            
            <Button onClick={handleCompanyInfoSave} disabled={isSaving}>
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
            <div className="flex gap-2">
                <Button onClick={handleSmtpSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save SMTP Settings'}</Button>
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
