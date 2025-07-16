
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
import type { User, Role, UserStatus } from '@/lib/types';
import { userStatuses } from '@/lib/mock-data';

interface EditUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  roles: Role[];
  onUpdateUser: (userId: string, data: Partial<User>) => void;
}

export function EditUserDialog({ isOpen, onOpenChange, user, roles, onUpdateUser }: EditUserDialogProps) {
  const [roleId, setRoleId] = useState(user.roleId);
  const [status, setStatus] = useState<UserStatus>(user.status);

  // Determine if this is an approval flow (user is pending and has no role)
  const isApprovalFlow = user.status === 'Pending' && !user.roleId;

  useEffect(() => {
    setRoleId(user.roleId);
    setStatus(user.status);
  }, [user]);

  const handleSave = () => {
    const updatedData: Partial<User> = {};
    
    if (roleId && roleId !== user.roleId) {
      updatedData.roleId = roleId;
    }
    
    if (status !== user.status) {
      updatedData.status = status;
    }
    
    // If it's an approval flow, we must set the status to Active
    if (isApprovalFlow && roleId) {
        updatedData.status = 'Active';
    }

    if (Object.keys(updatedData).length > 0) {
      onUpdateUser(user.id, updatedData);
    }
    onOpenChange(false);
  };

  const canSave = !isApprovalFlow || (isApprovalFlow && !!roleId);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User: {user.name}</DialogTitle>
          <DialogDescription>
             {isApprovalFlow
              ? "This user requires a role to be approved. Their status will be set to 'Active'."
              : "Update the user's role and status."
            }
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={status} 
              onValueChange={(value) => setStatus(value as UserStatus)} 
              disabled={isApprovalFlow}
            >
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
          <Button onClick={handleSave} disabled={!canSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
