'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/context/SettingsContext";
import { ChangeEvent } from "react";

export default function SettingsPage() {
  const { companyName, setCompanyName, logoUrl, setLogoUrl } = useSettings();

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
                <Input id="company-name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="company-logo">Company Logo</Label>
                <Input id="company-logo" type="file" onChange={handleLogoUpload} accept="image/*" />
                <p className="text-sm text-muted-foreground">Upload a new logo for your company.</p>
                {logoUrl && (
                  <div className="mt-4">
                    <p className="text-sm font-medium">Logo Preview:</p>
                    <img src={logoUrl} alt="Company Logo Preview" className="h-16 w-auto mt-2 rounded-md border p-2" />
                  </div>
                )}
            </div>
            <Button>Save Company Info</Button>
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
            <div className="space-y-2">
                <Label>Default admin password is 'admin'. Please change it.</Label>
                 <Button>Change Password</Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
