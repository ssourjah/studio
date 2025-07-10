'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { mockTasks, statuses, taskTypes } from '@/lib/mock-data';
import type { Task, TaskStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { User, Calendar, Tag } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

export default function TaskManagementPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(mockTasks);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTasks.map(task => (
                    <Card key={task.id} className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-lg">{task.name}</CardTitle>
                            <CardDescription>{task.jobNumber}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 flex-grow">
                            <Separator />
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <User className="h-4 w-4" />
                                <span>{task.assignedTechnician}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>{format(new Date(task.date), "LLL dd, y")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Tag className="h-4 w-4" />
                                <span>{task.type}</span>
                            </div>
                        </CardContent>
                         <div className="p-6 pt-0">
                            <Badge variant="secondary" className={cn("text-secondary-foreground", getStatusBadgeColor(task.status))}>
                                {task.status}
                            </Badge>
                         </div>
                    </Card>
                ))}
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
