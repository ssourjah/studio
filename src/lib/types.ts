export type TaskStatus = 'Incomplete' | 'Completed' | 'Cancelled';

export type Task = {
  id: string;
  jobNumber: string;
  name: string;
  type: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  contactPerson: string;
  contactPhone: string;
  date: string;
  status: TaskStatus;
  assignedTechnician: string;
  updatedBy: string;
};

export type UserStatus = 'Active' | 'Pending';
export type AccessLevel = 'Admin' | 'Support' | 'Technician' | 'Manager';


export type User = {
    id: string;
    name: string;
    username: string;
    email: string;
    phone: string;
    employeeId: string;
    department: string;
    designation: string;
    accessLevel: AccessLevel;
    status: UserStatus;
};

export type Designation = {
  id: string;
  name: string;
  accessLevel: AccessLevel;
};
