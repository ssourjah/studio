'use client';
import { useState } from 'react';
import Link from 'next/link';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { StatusCharts } from '@/components/dashboard/status-charts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { mockTasks } from '@/lib/mock-data';
import type { Task, TaskStatus } from '@/lib/types';
import { MoreHorizontal, Plus, User, Calendar, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);

  const handleUpdateStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const pendingTasks = tasks.filter(task => task.status === 'Incomplete');

  return (
    <div className="space-y-6">
      <SummaryCards />
      <StatusCharts />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Pending Tasks</CardTitle>
                <CardDescription>Tasks that need attention.</CardDescription>
            </div>
            <Button asChild>
                <Link href="/tasks">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Task
                </Link>
            </Button>
        </CardHeader>
        <CardContent>
            {pendingTasks.length > 0 ? (
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {pendingTasks.map(task => (
                        <Card key={task.id} className="flex flex-col">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg">{task.name}</CardTitle>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleUpdateStatus(task.id, 'Completed')}>
                                                Mark as Completed
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleUpdateStatus(task.id, 'Cancelled')}>
                                                Mark as Cancelled
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
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
                                <Badge variant="secondary" className="bg-orange-500/80 text-secondary-foreground">
                                    {task.status}
                                </Badge>
                             </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    <p>No pending tasks. Great job!</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
