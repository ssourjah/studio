
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Trash2 } from "lucide-react";
import { accessLevels } from "@/lib/mock-data";
import type { Designation, AccessLevel } from "@/lib/types";
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
} from "@/components/ui/alert-dialog"
import { db } from '@/lib/firebase';
import { collection, setDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';


export default function AdministratorPage() {
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [newDesignationName, setNewDesignationName] = useState('');
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<AccessLevel | ''>('');
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "designations"), (snapshot) => {
        const designationsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Designation));
        setDesignations(designationsData);
    });
    return () => unsubscribe();
  }, []);

  const handleAddDesignation = async () => {
    if (newDesignationName.trim() && selectedAccessLevel) {
      try {
        const newDesignationRef = doc(collection(db, 'designations'));
        await setDoc(newDesignationRef, {
          name: newDesignationName.trim(),
          accessLevel: selectedAccessLevel
        });
        toast({ title: "Success", description: "Designation added successfully." });
        setNewDesignationName('');
        setSelectedAccessLevel('');
      } catch (error) {
        console.error("Error adding designation: ", error);
        toast({ title: "Error", description: "Could not add designation.", variant: "destructive" });
      }
    }
  };
  
  const handleDeleteDesignation = async (id: string) => {
    try {
        await deleteDoc(doc(db, "designations", id));
        toast({ title: "Success", description: "Designation deleted successfully." });
    } catch (error) {
        toast({ title: "Error", description: "Could not delete designation.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6" suppressHydrationWarning>
      <Card>
        <CardHeader>
          <CardTitle>Manage Designations</CardTitle>
          <CardDescription>Add or remove job designations and assign their access level.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="designation-name">Designation Name</Label>
              <Input 
                id="designation-name" 
                placeholder="e.g., Senior Technician"
                value={newDesignationName}
                onChange={(e) => setNewDesignationName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="access-level">Access Level</Label>
              <Select value={selectedAccessLevel} onValueChange={(value) => setSelectedAccessLevel(value as AccessLevel)}>
                <SelectTrigger id="access-level">
                  <SelectValue placeholder="Select access level" />
                </SelectTrigger>
                <SelectContent>
                  {accessLevels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddDesignation} disabled={!newDesignationName || !selectedAccessLevel}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Designation
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Existing Designations</CardTitle>
            <CardDescription>A list of all designations and their assigned roles.</CardDescription>
        </CardHeader>
        <CardContent>
             <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Designation</TableHead>
                            <TableHead>Access Level</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {designations.map((designation) => (
                            <TableRow key={designation.id}>
                                <TableCell className="font-medium">{designation.name}</TableCell>
                                <TableCell>{designation.accessLevel}</TableCell>
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
                                          This action cannot be undone. This will permanently delete the <strong>{designation.name}</strong> designation.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteDesignation(designation.id)} className="bg-destructive hover:bg-destructive/90">
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                         {designations.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground">
                                    No designations found.
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
