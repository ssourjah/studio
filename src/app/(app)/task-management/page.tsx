'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { statuses, taskTypes } from '@/lib/mock-data';
import type { Task, TaskStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MapPin } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

export default function TaskManagementPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    const q = query(collection(db, "tasks"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
        setTasks(tasksData);
        setFilteredTasks(tasksData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let tempTasks = [...tasks];

    if (statusFilter !== 'all') {
      tempTasks = tempTasks.filter(task => task.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      tempTasks = tempTasks.filter(task => task.type === typeFilter);
    }

    setFilteredTasks(tempTasks);
  }, [statusFilter, typeFilter, tasks]);
  
  const clearFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
  }

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
  
  const handleNavigate = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, '_blank');
  };

  return (
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
                    <TableCell>{task.assignedTechnician}</TableCell>
                    <TableCell>{format(new Date(task.date), "LLL dd, y")}</TableCell>
                    <TableCell>
                        <Badge variant="secondary" className={cn("text-secondary-foreground", getStatusBadgeColor(task.status))}>
                            {task.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {task.latitude && task.longitude && (
                          <Button variant="outline" size="icon" onClick={() => handleNavigate(task.latitude!, task.longitude!)}>
                              <MapPin className="h-4 w-4" />
                          </Button>
                       )}
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
  );
}
