
'use client';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { technicians, statuses } from '@/lib/mock-data';
import { Calendar as CalendarIcon, FileSpreadsheet, FileText, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { DateRange } from "react-day-picker";
import type { Task, User } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';


export default function ReportsPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [allTechnicians, setAllTechnicians] = useState<User[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [date, setDate] = useState<DateRange | undefined>()

    const usersMap = new Map(users.map(user => [user.id, user.name]));
    
    useEffect(() => {
        const q = query(collection(db, "tasks"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
            setTasks(tasksData);
        });

        const techQuery = query(collection(db, "users"), where("accessLevel", "==", "Technician"));
        const techUnsubscribe = onSnapshot(techQuery, (snapshot) => {
            const techData: User[] = [];
            snapshot.forEach(doc => techData.push({ id: doc.id, ...doc.data() } as User));
            setAllTechnicians(techData);
        });

        const usersQuery = query(collection(db, "users"));
        const usersUnsubscribe = onSnapshot(usersQuery, (querySnapshot) => {
            const usersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
            setUsers(usersData);
        });

        return () => {
            unsubscribe();
            techUnsubscribe();
            usersUnsubscribe();
        };
    }, []);

    const sortedTasks = useMemo(() => {
        return [...tasks].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [tasks]);

    const handleNavigate = (lat: number, lng: number) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        window.open(url, '_blank');
    };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <CardTitle>Task Report</CardTitle>
                <CardDescription>View, filter, and export all tasks.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline"><FileText className="mr-2 h-4 w-4" /> Export to PDF</Button>
                <Button variant="outline"><FileSpreadsheet className="mr-2 h-4 w-4" /> Export to Excel</Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col md:flex-row gap-4">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                        "w-full md:w-[300px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                    )}
                    >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                        date.to ? (
                        <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                        </>
                        ) : (
                        format(date.from, "LLL dd, y")
                        )
                    ) : (
                        <span>Pick a date range</span>
                    )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>
            <Select>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    {statuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                </SelectContent>
            </Select>
             <Select>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by technician" />
                </SelectTrigger>
                <SelectContent>
                    {allTechnicians.map(tech => <SelectItem key={tech.id} value={tech.name}>{tech.name}</SelectItem>)}
                </SelectContent>
            </Select>
             <Button>Apply Filters</Button>
        </div>
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Job Number</TableHead>
                    <TableHead>Task Name</TableHead>
                    <TableHead>Technician</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {sortedTasks.map((task) => (
                    <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.jobNumber}</TableCell>
                    <TableCell>{task.name}</TableCell>
                    <TableCell>{usersMap.get(task.assignedTechnicianId) || 'Unknown'}</TableCell>
                    <TableCell>{format(new Date(task.date), "LLL dd, y")}</TableCell>
                    <TableCell>
                        <Badge variant={task.status === 'Cancelled' ? 'destructive' : 'secondary'}
                         className={cn(
                            "text-foreground",
                            task.status === 'Completed' && 'bg-green-600/80',
                            task.status === 'Incomplete' && 'bg-orange-500/80',
                        )}
                        >
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
      </CardContent>
    </Card>
  );
}
