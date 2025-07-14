
'use client';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Trash2, UserCheck, Edit } from 'lucide-react';
import type { User, UserStatus, Designation } from '@/lib/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';
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
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { EditUserDialog } from '@/components/user-management/edit-user-dialog';

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        setUsers(usersData);
    });
    const unsubscribeDesignations = onSnapshot(collection(db, "designations"), (snapshot) => {
      const designationsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Designation));
      setDesignations(designationsData);
    });
    return () => {
      unsubscribeUsers();
      unsubscribeDesignations();
    };
  }, []);
  
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => a.name.localeCompare(b.name));
  }, [users]);
  
  const handleApprove = async (userId: string) => {
    const userDocRef = doc(db, 'users', userId);
    try {
        await updateDoc(userDocRef, { status: 'Active' });
        toast({ title: "Success", description: "User has been approved." });
    } catch (error) {
        toast({ title: "Error", description: "Could not approve user.", variant: "destructive" });
    }
  };
  
  const handleDelete = async (userId: string) => {
    try {
        await deleteDoc(doc(db, 'users', userId));
        toast({ title: "Success", description: "User has been deleted." });
    } catch (error) {
        toast({ title: "Error", description: "Could not delete user.", variant: "destructive" });
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateUser = async (userId: string, data: Partial<User>) => {
    const userDocRef = doc(db, 'users', userId);
    try {
        await updateDoc(userDocRef, data);
        toast({ title: "User Updated", description: "User details have been saved." });
        setIsEditDialogOpen(false);
    } catch (error) {
        toast({ title: "Error", description: "Could not update user.", variant: "destructive" });
    }
  };

  const getStatusBadgeVariant = (status: UserStatus) => {
    switch (status) {
      case 'Active':
        return 'bg-green-600/80';
      case 'Pending':
        return 'bg-orange-500/80';
      case 'Suspended':
        return 'bg-yellow-500/80';
      default:
        return 'secondary';
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and permissions.</CardDescription>
          </div>
          <Button asChild>
              <Link href="/user-management/invite">
                  <PlusCircle />
                  Invite New User
              </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Full Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Designation</TableHead>
                          <TableHead>Access Level</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {sortedUsers.map(user => (
                          <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.name}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>{user.designation}</TableCell>
                              <TableCell>{user.accessLevel}</TableCell>
                              <TableCell>
                                  <Badge variant="secondary" className={cn("text-secondary-foreground", getStatusBadgeVariant(user.status))}>
                                      {user.status}
                                  </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                  <AlertDialog>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEdit(user)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit User
                                            </DropdownMenuItem>
                                            {user.status === 'Pending' && (
                                                <DropdownMenuItem onClick={() => handleApprove(user.id)}>
                                                    <UserCheck className="mr-2" />
                                                    Approve
                                                </DropdownMenuItem>
                                            )}
                                            <AlertDialogTrigger asChild>
                                                  <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-destructive/10">
                                                       <Trash2 className="mr-2 h-4 w-4" />
                                                       Delete
                                                  </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the user account for {user.name}.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(user.id)} className="bg-destructive hover:bg-destructive/90">
                                                Delete User
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                              </TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
          </div>
        </CardContent>
      </Card>
      {selectedUser && (
        <EditUserDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          user={selectedUser}
          designations={designations}
          onUpdateUser={handleUpdateUser}
        />
      )}
    </>
  );
}
