

export type TaskStatus = 'Incomplete' | 'Completed' | 'Cancelled';
export type ReportFormat = 'pdf' | 'excel' | 'csv';

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
  assignedTechnicianId: string;
  updatedBy: string;
  technicianName?: string;
};

export type UserStatus = 'Active' | 'Pending' | 'Suspended';
export type AccessLevel = 'Admin' | 'Support' | 'Technician' | 'Manager';

export type ThemePreference = 'light' | 'dark' | 'system';
export type FontSizePreference = 'sm' | 'base' | 'lg';

export interface ColorTheme {
    background: string;
    foreground: string;
    card: string;
    primary: string;
    accent: string;
}

export interface UserPreferences {
    theme?: ThemePreference;
    fontSize?: FontSizePreference;
    customLightTheme?: ColorTheme;
    customDarkTheme?: ColorTheme;
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

export type PermissionLevel = 'dashboard' | 'tasks' | 'taskManagement' | 'userManagement' | 'reports' | 'administrator' | 'settings';

export type Role = {
  id: string;
  name: string;
  isTechnician?: boolean;
  permissions: Record<PermissionLevel, Permission>;
}

export type SmtpSettings = {
    smtpHost: string;
    smtpPort: string;
    smtpUser: string;
    smtpPassword?: string;
};
