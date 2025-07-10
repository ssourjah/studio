import { Task, TaskStatus, User } from "@/lib/types";

export const summaryData = {
  total: 125,
  completed: 85,
  incomplete: 30,
  cancelled: 10,
};

export const statusPieChartData = [
  { name: 'Completed', value: 85, fill: 'var(--color-completed)' },
  { name: 'Incomplete', value: 30, fill: 'var(--color-incomplete)' },
  { name: 'Cancelled', value: 10, fill: 'var(--color-cancelled)' },
];

export const statusPieChartConfig = {
  completed: { label: 'Completed', color: 'hsl(var(--chart-2))' },
  incomplete: { label: 'Incomplete', color: 'hsl(var(--chart-4))' },
  cancelled: { label: 'Cancelled', color: 'hsl(var(--destructive))' },
};

export const progressChartData = [
  { date: '2024-07-01', "Completed": 3, "Incomplete": 1 },
  { date: '2024-07-02', "Completed": 5, "Incomplete": 2 },
  { date: '2024-07-03', "Completed": 4, "Incomplete": 1 },
  { date: '2024-07-04', "Completed": 7, "Incomplete": 3 },
  { date: '2024-07-05', "Completed": 6, "Incomplete": 2 },
  { date: '2024-07-06', "Completed": 8, "Incomplete": 1 },
  { date: '2024-07-07', "Completed": 5, "Incomplete": 0 },
];

export const tasksBarChartData = [
    { name: 'Installations', "Completed": 30, "Incomplete": 10, "Cancelled": 2 },
    { name: 'Inspections', "Completed": 25, "Incomplete": 8, "Cancelled": 3 },
    { name: 'Removals', "Completed": 20, "Incomplete": 7, "Cancelled": 4 },
    { name: 'Re-installations', "Completed": 10, "Incomplete": 5, "Cancelled": 1 },
];

export const mockTasks: Task[] = [
  {
    id: "TASK-8782",
    jobNumber: "JB-2024-001",
    name: "Install New Server Rack",
    type: "Installation",
    description: "Install a new 42U server rack in data center room 3.",
    location: "Data Center 3",
    contactInfo: "john.doe@example.com",
    date: "2024-07-15",
    status: "Completed",
    assignedTechnician: "Alice",
    updatedBy: "Admin",
  },
  {
    id: "TASK-7878",
    jobNumber: "JB-2024-002",
    name: "Fiber Optic Cable Inspection",
    type: "Inspection",
    description: "Inspect fiber optic backbone between building A and B.",
    location: "Campus Grounds",
    contactInfo: "network.ops@example.com",
    date: "2024-07-16",
    status: "Incomplete",
    assignedTechnician: "Bob",
    updatedBy: "Operations",
  },
  {
    id: "TASK-4589",
    jobNumber: "JB-2024-003",
    name: "Decommission Old SAN",
    type: "Removal",
    description: "Power down and remove the old EMC SAN storage array.",
    location: "Data Center 1",
    contactInfo: "storage.team@example.com",
    date: "2024-07-18",
    status: "Incomplete",
    assignedTechnician: "Charlie",
    updatedBy: "Admin",
  },
    {
    id: "TASK-1262",
    jobNumber: "JB-2024-004",
    name: "Workstation Re-installation",
    type: "Re-installation",
    description: "Re-image and re-install OS on 10 workstations in the finance department.",
    location: "Building C, Floor 2",
    contactInfo: "finance.dept@example.com",
    date: "2024-07-20",
    status: "Completed",
    assignedTechnician: "Alice",
    updatedBy: "Operations",
  },
  {
    id: "TASK-9921",
    jobNumber: "JB-2024-005",
    name: "Security Camera Setup",
    type: "Installation",
    description: "Install 5 new security cameras on the west perimeter.",
    location: "West Perimeter",
    contactInfo: "security@example.com",
    date: "2024-07-22",
    status: "Cancelled",
    assignedTechnician: "David",
    updatedBy: "Admin",
  },
];

export const technicians = ["Alice", "Bob", "Charlie", "David"];
export const statuses: TaskStatus[] = ["Incomplete", "Completed", "Cancelled"];
export const taskTypes = ["Installation", "Re-installation", "Inspection", "Removal"];

export const mockUsers: User[] = [
    { id: 'USR-001', name: 'Admin User', username: 'admin', email: 'admin@taskmaster.pro', role: 'Administrator', status: 'Active' },
    { id: 'USR-002', name: 'Alice Johnson', username: 'alicej', email: 'alice.j@taskmaster.pro', role: 'Technician', status: 'Active' },
    { id: 'USR-003', name: 'Bob Williams', username: 'bobw', email: 'bob.w@taskmaster.pro', role: 'Technician', status: 'Active' },
    { id: 'USR-004', name: 'Charlie Brown', username: 'charlieb', email: 'charlie.b@taskmaster.pro', role: 'Manager', status: 'Pending' },
    { id: 'USR-005', name: 'David Smith', username: 'davids', email: 'david.s@taskmaster.pro', role: 'Technician', status: 'Active' },
    { id: 'USR-006', name: 'Eve Davis', username: 'eved', email: 'eve.d@taskmaster.pro', role: 'Technician', status: 'Pending' },
];
