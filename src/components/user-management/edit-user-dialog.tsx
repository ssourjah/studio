
'use client';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import type { User, Designation, AccessLevel, UserStatus } from '@/lib/types';
import { accessLevels, userStatuses } from '@/lib/mock-data';

interface EditUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  designations: Designation[];
  onUpdateUser: (userId: string, data: Partial<User>) => void;
}

export function EditUserDialog({ isOpen, onOpenChange, user, designations, onUpdateUser }: EditUserDialogProps) {
  const [designation, setDesignation] = useState(user.designation);
  const [accessLevel, setAccessLevel] = useState<AccessLevel>(user.accessLevel);
  const [status, setStatus] = useState<UserStatus>(user.status);

  useEffect(() => {
    setDesignation(user.designation);
    setAccessLevel(user.accessLevel);
    setStatus(user.status);
  }, [user]);

  const handleSave = () => {
    const updatedData: Partial<User> = {};
    if (designation !== user.designation) updatedData.designation = designation;
    if (accessLevel !== user.accessLevel) updatedData.accessLevel = accessLevel;
    if (status !== user.status) updatedData.status = status;

    if (Object.keys(updatedData).length > 0) {
      onUpdateUser(user.id, updatedData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User: {user.name}</DialogTitle>
          <DialogDescription>
            Update the user's role, permissions, and status.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="designation">Designation</Label>
            <Select value={designation} onValueChange={setDesignation}>
              <SelectTrigger id="designation">
                <SelectValue placeholder="Select designation" />
              </SelectTrigger>
              <SelectContent>
                {designations.map((d) => (
                  <SelectItem key={d.id} value={d.name}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="access-level">Access Level</Label>
            <Select value={accessLevel} onValueChange={(value) => setAccessLevel(value as AccessLevel)}>
              <SelectTrigger id="access-level">
                <SelectValue placeholder="Select access level" />
              </SelectTrigger>
              <SelectContent>
                {accessLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as UserStatus)}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {userStatuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
