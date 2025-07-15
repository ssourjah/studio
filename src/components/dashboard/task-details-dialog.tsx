
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, Tag, MapPin, Phone, FileText } from 'lucide-react';
import { format } from 'date-fns';
import type { Task, TaskStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TaskDetailsDialogProps {
  task: Task | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
}

export function TaskDetailsDialog({ task, isOpen, onOpenChange, onUpdateStatus }: TaskDetailsDialogProps) {
  if (!task) return null;

  const handleNavigate = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, '_blank');
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="break-words">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle>{task.name}</DialogTitle>
              <DialogDescription>{task.jobNumber}</DialogDescription>
            </div>
             <Badge variant="secondary" className={cn("text-secondary-foreground mt-1", getStatusBadgeColor(task.status))}>
                {task.status}
            </Badge>
          </div>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Separator />
          <div className="space-y-3 text-sm">
             <div className="flex items-start gap-3">
              <FileText className="h-4 w-4 mt-1 flex-shrink-0 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">Description</p>
                <p className="text-muted-foreground">{task.description}</p>
              </div>
            </div>
             <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <p>Assigned to <span className="font-medium">{task.assignedTechnician}</span></p>
            </div>
             <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <p>Scheduled for <span className="font-medium">{format(new Date(task.date), 'PPP')}</span></p>
            </div>
            <div className="flex items-center gap-3">
              <Tag className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <p>Type: <span className="font-medium">{task.type}</span></p>
            </div>
             {task.latitude && task.longitude && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <p>Location: <span className="font-medium">{task.location}</span></p>
              </div>
            )}
            <Separator className="my-3"/>
             <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <p>Contact: <span className="font-medium">{task.contactPerson}</span></p>
            </div>
             <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                 <p>Phone: <span className="font-medium">{task.contactPhone}</span></p>
            </div>
          </div>
           <Separator />
        </div>
        <DialogFooter className="flex-col sm:flex-row sm:justify-end sm:items-center gap-2">
           <div className="flex-1 flex justify-start">
                {task.latitude && task.longitude && (
                    <Button variant="outline" onClick={() => handleNavigate(task.latitude!, task.longitude!)}>
                        <MapPin className="mr-2 h-4 w-4" />
                        Navigate
                    </Button>
                )}
           </div>
           <div className="flex gap-2">
                <Button variant="outline" onClick={() => onUpdateStatus(task.id, 'Cancelled')}>Mark as Cancelled</Button>
                <Button onClick={() => onUpdateStatus(task.id, 'Completed')}>Mark as Completed</Button>
           </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
