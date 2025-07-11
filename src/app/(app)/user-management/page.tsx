
'use client';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Trash2, UserCheck } from 'lucide-react';
import type { User, UserStatus } from '@/lib/types';
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
} from "@/components/ui/alert-dialog";
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        setUsers(usersData);
    });
    return () => unsubscribe();
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
  }

  const getStatusBadgeVariant = (status: UserStatus) => {
    switch (status) {
      case 'Active':
        return 'bg-green-600/80';
      case 'Pending':
        return 'bg-orange-500/80';
      default:
        return 'secondary';
    }
  };

  return (
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
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {user.status === 'Pending' && (
                                            <DropdownMenuItem onClick={() => handleApprove(user.id)}>
                                                <UserCheck className="mr-2" />
                                                Approve
                                            </DropdownMenuItem>
                                        )}
                                        <AlertDialog>
                                             <AlertDialogTrigger asChild>
                                                <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 p-2 m-0 h-auto font-normal">
                                                     <Trash2 className="mr-2" />
                                                     Delete
                                                </Button>
                                             </AlertDialogTrigger>
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
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
