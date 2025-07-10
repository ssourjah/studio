'use client';
import { APIProvider } from '@vis.gl/react-google-maps';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LocationPicker, type Location } from '@/components/tasks/location-picker';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { mockTasks, taskTypes, technicians } from '@/lib/mock-data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

export default function TasksPage() {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const [location, setLocation] = useState<Location | null>(null);
    const [date, setDate] = useState<Date | undefined>();

    return (
        <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Task</CardTitle>
                        <CardDescription>Fill out the details to create a new task.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="task-name">Task Name</Label>
                            <Input id="task-name" placeholder="e.g., Server Maintenance" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="task-type">Task Type</Label>
                            <Select>
                                <SelectTrigger id="task-type">
                                    <SelectValue placeholder="Select task type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {taskTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="task-desc">Task Description</Label>
                            <Textarea id="task-desc" placeholder="Describe the task in detail (max 256 words)" maxLength={1500} />
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
                                        Google Maps API key is not configured. Please add it to your .env.local file to enable the map.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="contact-person">Contact Person</Label>
                                <Input id="contact-person" placeholder="e.g., John Doe" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="contact-phone">Contact Phone</Label>
                                <Input id="contact-phone" placeholder="e.g., 123-456-7890" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="technician">Assign Technician</Label>
                             <Select>
                                <SelectTrigger id="technician">
                                    <SelectValue placeholder="Select a technician" />
                                </SelectTrigger>
                                <SelectContent>
                                    {technicians.map(tech => <SelectItem key={tech} value={tech}>{tech}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button className="w-full">Create Task</Button>
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
                               {mockTasks.slice(0, 5).map(task => (
                                   <TableRow key={task.id}>
                                       <TableCell className="font-medium">{task.name}</TableCell>
                                       <TableCell>{task.assignedTechnician}</TableCell>
                                       <TableCell>
                                           <Badge variant={task.status === 'Completed' ? 'default' : task.status === 'Cancelled' ? 'destructive' : 'secondary'}
                                           className={cn(
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
