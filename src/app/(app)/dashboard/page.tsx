
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { StatusCharts } from '@/components/dashboard/status-charts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Task, TaskStatus } from '@/lib/types';
import { User, Calendar, Tag, MapPin, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TaskDetailsDialog } from '@/components/dashboard/task-details-dialog';
import { collection, query, where, onSnapshot, doc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { userRole } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [summaryData, setSummaryData] = useState({ total: 0, completed: 0, incomplete: 0, cancelled: 0 });

  const canCreateTasks = userRole?.permissions?.tasks?.create ?? false;

  useEffect(() => {
    const q = query(collection(db, "tasks"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasksData: Task[] = [];
      let completed = 0, incomplete = 0, cancelled = 0;
      querySnapshot.forEach((doc) => {
        const task = { id: doc.id, ...doc.data() } as Task;
        tasksData.push(task);
        if (task.status === 'Completed') completed++;
        else if (task.status === 'Incomplete') incomplete++;
        else if (task.status === 'Cancelled') cancelled++;
      });
      setTasks(tasksData);
      setSummaryData({ total: tasksData.length, completed, incomplete, cancelled });
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    const taskDocRef = doc(db, 'tasks', taskId);
    await updateDoc(taskDocRef, { status: newStatus });
    setIsDialogOpen(false); // Close dialog after action
  };
  
  const handleCardClick = (task: Task) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  };

  const pendingTasks = tasks.filter(task => task.status === 'Incomplete');

  return (
    <div className="space-y-6">
      <SummaryCards summaryData={summaryData} />
      <StatusCharts tasks={tasks} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Pending Tasks</CardTitle>
                <CardDescription>Tasks that need attention.</CardDescription>
            </div>
            {canCreateTasks && (
                <Button asChild>
                    <Link href="/tasks">
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Task
                    </Link>
                </Button>
            )}
        </CardHeader>
        <CardContent>
            {pendingTasks.length > 0 ? (
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {pendingTasks.map(task => (
                        <Card key={task.id} className="flex flex-col hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleCardClick(task)}>
                            <CardHeader>
                                <div className="flex-1">
                                    <CardTitle className="text-lg">{task.name}</CardTitle>
                                    <CardDescription>{task.jobNumber}</CardDescription>
                                </div>
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
                                 {task.latitude && task.longitude && (
                                     <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        <span>{task.location}</span>
                                     </div>
                                 )}
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
      
      <TaskDetailsDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        task={selectedTask}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
