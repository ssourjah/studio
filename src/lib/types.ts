

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

export type UserStatus = 'Active' | 'Pending' | 'Suspended';
export type AccessLevel = 'Admin' | 'Support' | 'Technician' | 'Manager';

export type ThemePreference = 'light' | 'dark' | 'system';
export type FontSizePreference = 'sm' | 'base' | 'lg';

export interface UserPreferences {
    theme: ThemePreference;
    fontSize: FontSizePreference;
}

export type User = {
    id: string;
    name: string;
    username: string;
    email: string;
    phone: string;
    employeeId: string;
    department: string;
    roleId?: string;
    accessLevel: AccessLevel; // Will be deprecated, but keep for now
    status: UserStatus;
    avatarUrl?: string;
    preferences?: UserPreferences;
};

export type Permission = {
  read: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export type PermissionLevel = 'dashboard' | 'tasks' | 'taskManagement' | 'userManagement' | 'reports' | 'settings' | 'administrator';

export type Role = {
  id: string;
  name: string;
  permissions: Record<PermissionLevel, Permission>;
}
