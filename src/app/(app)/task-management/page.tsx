
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { statuses, taskTypes } from '@/lib/mock-data';
import type { Task, TaskStatus, User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, Trash2, Eye } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { TaskDetailsDialog } from '@/components/dashboard/task-details-dialog';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export default function TaskManagementPage() {
  const { userRole } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const canDeleteTasks = userRole?.permissions?.taskManagement?.delete ?? false;
  const usersMap = new Map(users.map(user => [user.id, user.name]));

  useEffect(() => {
    const q = collection(db, "tasks");
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
        setTasks(tasksData);
        setFilteredTasks(tasksData); // Initialize filtered tasks
    });

    const usersQuery = query(collection(db, "users"));
    const usersUnsubscribe = onSnapshot(usersQuery, (querySnapshot) => {
        const usersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        setUsers(usersData);
    });

    return () => {
        unsubscribe();
        usersUnsubscribe();
    };
  }, []);

  useEffect(() => {
    let tempTasks = [...tasks];
    if (statusFilter !== 'all') {
      tempTasks = tempTasks.filter(task => task.status === statusFilter);
    }
    if (typeFilter !== 'all') {
      tempTasks = tempTasks.filter(task => task.type === typeFilter);
    }
    setFilteredTasks(tempTasks.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, [statusFilter, typeFilter, tasks]);
  
  const clearFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
  }

  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    const taskDocRef = doc(db, 'tasks', taskId);
    await updateDoc(taskDocRef, { status: newStatus });
    toast({ title: "Success", description: `Task status updated to ${newStatus}.` });
    setIsDialogOpen(false);
  };
  
  const handleDeleteTask = async (taskId: string) => {
    if (!canDeleteTasks) {
        toast({ title: "Permission Denied", description: "You cannot delete tasks.", variant: "destructive" });
        return;
    }
    try {
        await deleteDoc(doc(db, "tasks", taskId));
        toast({ title: "Success", description: "Task deleted successfully." });
    } catch (error) {
        toast({ title: "Error", description: "Could not delete task.", variant: "destructive" });
    }
  };

  const handleViewDetails = (task: Task) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  };

  const getStatusBadgeColor = (status: TaskStatus) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-600/80';
      case 'Incomplete':
        return 'bg-orange-500/80';
      case 'Cancelled':
        return 'bg-destructive';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Task Management</CardTitle>
          <CardDescription>View, filter, and manage all tasks.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col md:flex-row gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {statuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                  </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {taskTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                  </SelectContent>
              </Select>
              <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
          </div>
          
          {filteredTasks.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                  <TableHeader>
                  <TableRow>
                      <TableHead>Job Number</TableHead>
                      <TableHead>Task Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Technician</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                  </TableHeader>
                  <TableBody>
                  {filteredTasks.map((task) => (
                      <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.jobNumber}</TableCell>
                      <TableCell>{task.name}</TableCell>
                      <TableCell>{task.type}</TableCell>
                      <TableCell>{usersMap.get(task.assignedTechnicianId) || 'Unknown'}</TableCell>
                      <TableCell>{format(new Date(task.date), "LLL dd, y")}</TableCell>
                      <TableCell>
                          <Badge variant="secondary" className={cn("text-foreground", getStatusBadgeColor(task.status))}>
                              {task.status}
                          </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleViewDetails(task)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Details
                                    </DropdownMenuItem>
                                    {canDeleteTasks && (
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem className="text-red-600 focus:text-red-600">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete Task
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the task: <strong>{task.name}</strong>.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteTask(task.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                      </TableRow>
                  ))}
                  </TableBody>
              </Table>
          </div>
          ) : (
              <div className="text-center py-12 text-muted-foreground">
                  <p>No tasks match the current filters.</p>
              </div>
          )}
        </CardContent>
      </Card>
      
      <TaskDetailsDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        task={selectedTask}
        technicianName={selectedTask ? usersMap.get(selectedTask.assignedTechnicianId) || 'Unknown' : 'Unknown'}
        onUpdateStatus={handleUpdateStatus}
      />
    </>
  );
}
