
'use client';
import { APIProvider } from '@vis.gl/react-google-maps';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LocationPicker, type Location } from '@/components/tasks/location-picker';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Task, User } from '@/lib/types';
import { taskTypes } from '@/lib/mock-data';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';

const taskSchema = z.object({
    name: z.string().min(1, "Task name is required"),
    type: z.string().min(1, "Task type is required"),
    description: z.string().max(256, "Description must be 256 characters or less").optional(),
    location: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    contactPerson: z.string().min(1, "Contact person is required"),
    contactPhone: z.string().min(1, "Contact phone is required"),
    date: z.date({ required_error: "A date is required." }),
    assignedTechnicianId: z.string().min(1, "Please assign a technician"),
});

export default function TasksPage() {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const { toast } = useToast();
    const { userRole, currentUser } = useAuth();
    const { technicianRoleIds } = useSettings();
    const [location, setLocation] = useState<Location | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [technicians, setTechnicians] = useState<User[]>([]);

    const canCreateTasks = userRole?.permissions?.tasks?.create ?? false;
    const usersMap = new Map(users.map(user => [user.id, user.name]));


    const { register, handleSubmit, control, setValue, reset, formState: { errors } } = useForm({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            name: '',
            type: '',
            description: '',
            location: '',
            contactPerson: '',
            contactPhone: '',
            date: undefined,
            assignedTechnicianId: '',
        }
    });

    useEffect(() => {
        const q = query(collection(db, "tasks"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const tasksData: Task[] = [];
            querySnapshot.forEach((doc) => {
                tasksData.push({ id: doc.id, ...doc.data() } as Task);
            });
            setTasks(tasksData.slice(0, 5));
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
        if (technicianRoleIds.length > 0 && users.length > 0) {
            const techUsers = users.filter(user => user.roleId && technicianRoleIds.includes(user.roleId));
            setTechnicians(techUsers);
        } else {
            setTechnicians([]);
        }
    }, [technicianRoleIds, users]);

    useEffect(() => {
        if (location) {
            setValue('latitude', location.lat);
            setValue('longitude', location.lng);
            // Simple reverse geocoding approximation
            setValue('location', `Lat: ${location.lat.toFixed(4)}, Lng: ${location.lng.toFixed(4)}`);
        }
    }, [location, setValue]);

    const onSubmit = async (data: z.infer<typeof taskSchema>) => {
        if (!canCreateTasks) {
            toast({
                title: "Permission Denied",
                description: "You do not have permission to create tasks.",
                variant: 'destructive',
            });
            return;
        }

        if (!currentUser) {
            toast({
                title: "Error",
                description: "You must be logged in to create a task.",
                variant: 'destructive',
            });
            return;
        }

        try {
            await addDoc(collection(db, 'tasks'), {
                ...data,
                date: format(data.date, 'yyyy-MM-dd'),
                status: 'Incomplete',
                jobNumber: `JB-${new Date().getTime()}`,
                updatedBy: currentUser.id,
            });
            toast({
                title: "Task Created",
                description: "The new task has been successfully added.",
            });
            reset();
            setLocation(null);
        } catch (error) {
            console.error("Error adding document: ", error);
            toast({
                title: "Error",
                description: "There was an error creating the task.",
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Task</CardTitle>
                        <CardDescription>Fill out the details to create a new task.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {canCreateTasks ? (
                             <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="task-name">Task Name</Label>
                                    <Input id="task-name" placeholder="e.g., Server Maintenance" {...register('name')} />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="task-type">Task Type</Label>
                                    <Controller
                                        name="type"
                                        control={control}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger id="task-type">
                                                    <SelectValue placeholder="Select task type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {taskTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="task-desc">Task Description</Label>
                                    <Textarea id="task-desc" placeholder="Describe the task in detail (max 256 words)" maxLength={256} {...register('description')} />
                                    {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Location</Label>
                                    {apiKey ? (
                                        <APIProvider apiKey={apiKey}>
                                            <LocationPicker onLocationChange={setLocation} />
                                        </APIProvider>
                                    ) : (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertTitle>Configuration Missing</AlertTitle>
                                            <AlertDescription>
                                                Google Maps API key is not configured. Please add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to your .env file to enable the map.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="contact-person">Contact Person</Label>
                                        <Input id="contact-person" placeholder="e.g., John Doe" {...register('contactPerson')} />
                                        {errors.contactPerson && <p className="text-sm text-red-500">{errors.contactPerson.message as string}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contact-phone">Contact Phone</Label>
                                        <Input id="contact-phone" placeholder="e.g., 123-456-7890" {...register('contactPhone')} />
                                        {errors.contactPhone && <p className="text-sm text-red-500">{errors.contactPhone.message as string}</p>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="date">Date</Label>
                                    <Controller
                                        name="date"
                                        control={control}
                                        render={({ field }) => (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        )}
                                    />
                                    {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="technician">Assign Technician</Label>
                                    <Controller
                                        name="assignedTechnicianId"
                                        control={control}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger id="technician">
                                                    <SelectValue placeholder="Select a technician" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {technicians.map(tech => <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.assignedTechnicianId && <p className="text-sm text-red-500">{errors.assignedTechnicianId.message as string}</p>}
                                </div>
                                <Button type="submit" className="w-full">Create Task</Button>
                            </form>
                        ) : (
                             <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Access Denied</AlertTitle>
                                <AlertDescription>
                                    You do not have permission to create new tasks.
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Existing Tasks</CardTitle>
                        <CardDescription>A list of recently updated tasks.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <Table>
                           <TableHeader>
                               <TableRow>
                                   <TableHead>Task Name</TableHead>
                                   <TableHead>Technician</TableHead>
                                   <TableHead>Status</TableHead>
                               </TableRow>
                           </TableHeader>
                           <TableBody>
                               {tasks.map(task => (
                                   <TableRow key={task.id}>
                                       <TableCell className="font-medium">{task.name}</TableCell>
                                       <TableCell>{usersMap.get(task.assignedTechnicianId) || 'Unknown'}</TableCell>
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
                                   </TableRow>
                               ))}
                           </TableBody>
                       </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
