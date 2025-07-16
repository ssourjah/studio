
'use client';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { statuses } from '@/lib/mock-data';
import { Calendar as CalendarIcon, FileSpreadsheet, FileText, MapPin, ChevronDown, Mail, FilterX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isWithinInterval } from 'date-fns';
import type { DateRange } from "react-day-picker";
import type { Task, User, Role, ReportFormat } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { sendTaskReport } from '@/services/email';
import { generateTaskReportCsv } from '@/services/reports';

function SendReportDialog({ currentUserEmail, filteredTasks }: { currentUserEmail: string, filteredTasks: Task[] }) {
    const [recipient, setRecipient] = useState(currentUserEmail);
    const [format, setFormat] = useState<ReportFormat>('csv');
    const [isSending, setIsSending] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setRecipient(currentUserEmail);
    }, [currentUserEmail]);

    const handleSend = async () => {
        setIsSending(true);
        try {
            await sendTaskReport({ recipient, format, tasks: filteredTasks });
            toast({
                title: 'Report Sent',
                description: `The task report has been sent to ${recipient}.`
            });
        } catch (error: any) {
            toast({
                title: 'Failed to Send Report',
                description: error.message || 'An unexpected error occurred.',
                variant: 'destructive',
            });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline"><Mail className="mr-2 h-4 w-4" /> Send by Email</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Send Task Report</DialogTitle>
                    <DialogDescription>
                        The report will be generated based on the current filters and sent as an email attachment.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="recipient-email">Recipient Email</Label>
                        <Input
                            id="recipient-email"
                            type="email"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="report-format">Report Format</Label>
                        <Select value={format} onValueChange={(value) => setFormat(value as ReportFormat)}>
                            <SelectTrigger id="report-format">
                                <SelectValue placeholder="Select a format" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pdf">PDF (Coming Soon)</SelectItem>
                                <SelectItem value="excel">Excel (Coming Soon)</SelectItem>
                                <SelectItem value="csv">CSV</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSend} disabled={isSending}>
                        {isSending ? 'Sending...' : 'Send Report'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


export default function ReportsPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [allTechnicians, setAllTechnicians] = useState<User[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const { currentUser } = useAuth();
    const { toast } = useToast();
    
    // Filter states
    const [date, setDate] = useState<DateRange | undefined>();
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [technicianFilter, setTechnicianFilter] = useState<string>('all');

    const usersMap = new Map(users.map(user => [user.id, user.name]));
    
    useEffect(() => {
        const q = query(collection(db, "tasks"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
            setTasks(tasksData);
        });
        
        const usersQuery = query(collection(db, "users"));
        const usersUnsubscribe = onSnapshot(usersQuery, (querySnapshot) => {
            const usersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
            setUsers(usersData);
        });
        
        const rolesQuery = query(collection(db, "roles"));
        const rolesUnsubscribe = onSnapshot(rolesQuery, (querySnapshot) => {
            const rolesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Role));
            setRoles(rolesData);
        });

        return () => {
            unsubscribe();
            usersUnsubscribe();
            rolesUnsubscribe();
        };
    }, []);
    
    useEffect(() => {
        const technicianRoleIds = roles.filter(r => r.isTechnician).map(r => r.id);
        if (technicianRoleIds.length > 0 && users.length > 0) {
            const techUsers = users.filter(user => user.roleId && technicianRoleIds.includes(user.roleId));
            setAllTechnicians(techUsers);
        } else {
            setAllTechnicians([]);
        }
    }, [roles, users]);

    const filteredTasks = useMemo(() => {
        return tasks
            .filter(task => {
                const taskDate = new Date(task.date);
                const isDateMatch = !date?.from || (date.to ? isWithinInterval(taskDate, { start: date.from, end: date.to }) : format(date.from, 'yyyy-MM-dd') === format(taskDate, 'yyyy-MM-dd'));
                const isStatusMatch = statusFilter === 'all' || task.status === statusFilter;
                const isTechnicianMatch = technicianFilter === 'all' || task.assignedTechnicianId === technicianFilter;
                return isDateMatch && isStatusMatch && isTechnicianMatch;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [tasks, date, statusFilter, technicianFilter]);

    const handleNavigate = (lat: number, lng: number) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        window.open(url, '_blank');
    };

    const handleCsvExport = async () => {
        try {
            const csvData = await generateTaskReportCsv(filteredTasks);
            const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `task-report-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            toast({
                title: 'Export Failed',
                description: 'Could not generate the CSV report.',
                variant: 'destructive',
            });
        }
    };
    
    const clearFilters = () => {
        setDate(undefined);
        setStatusFilter('all');
        setTechnicianFilter('all');
    }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <CardTitle>Task Report</CardTitle>
                <CardDescription>View, filter, and export all tasks.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            Export
                            <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem disabled>
                            <FileText className="mr-2 h-4 w-4" />
                            Export to PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled>
                             <FileSpreadsheet className="mr-2 h-4 w-4" />
                            Export to Excel
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleCsvExport}>
                             <FileSpreadsheet className="mr-2 h-4 w-4" />
                            Export to CSV
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <SendReportDialog currentUserEmail={currentUser?.email || ''} filteredTasks={filteredTasks} />
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                </SelectContent>
            </Select>
             <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by technician" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Technicians</SelectItem>
                    {allTechnicians.map(tech => <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>)}
                </SelectContent>
            </Select>
             <Button variant="outline" onClick={clearFilters}><FilterX className="mr-2 h-4 w-4" /> Clear</Button>
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
                {filteredTasks.length > 0 ? filteredTasks.map((task) => (
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
                )) : (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center h-24">
                            No tasks found for the selected filters.
                        </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
