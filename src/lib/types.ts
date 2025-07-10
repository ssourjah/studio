export type TaskStatus = 'Incomplete' | 'Completed' | 'Cancelled';

export type Task = {
  id: string;
  jobNumber: string;
  name: string;
  type: string;
  description: string;
  location: string;
  contactInfo: string;
  date: string;
  status: TaskStatus;
  assignedTechnician: string;
  updatedBy: string;
};

export type UserStatus = 'Active' | 'Pending';

export type User = {
    id: string;
    name: string;
    username: string;
    email: string;
    role: 'Administrator' | 'Technician' | 'Manager';
    status: UserStatus;
};
