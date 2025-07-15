
'use client';
import { AppLogo } from '@/components/app-logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ListTodo,
  Settings,
  User as UserIcon,
  LogOut,
  LifeBuoy,
  Users,
  Shield,
  ChevronDown,
  FileSpreadsheet,
  LayoutDashboard,
  Palette,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const userMenuItems = [
  { href: '/profile', label: 'Profile', icon: UserIcon },
  { href: '/preferences', label: 'Preferences', icon: Palette },
];

const managementMenuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard' },
    { href: '/tasks', label: 'Create Task', icon: ListTodo, permission: 'tasks' },
    { href: '/task-management', label: 'Task Management', icon: ListTodo, permission: 'taskManagement' },
    { href: '/reports', label: 'Task Report', icon: FileSpreadsheet, permission: 'reports' },
    { href: '/user-management', label: 'User Management', icon: Users, permission: 'userManagement' },
    { href: '/administrator', label: 'Administrator', icon: Shield, permission: 'administrator' },
] as const;


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, userRole, loading, logout } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loading, router]);
  
  if (!isClient || loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-6">
          <Skeleton className="h-9 w-32" />
          <div className="flex flex-1 items-center justify-end gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-24 hidden md:block" />
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-muted/40 p-4 md:p-6">
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
      </div>
    );
  }

  // If loading is finished and there's no user, the useEffect above will redirect.
  // We can return null here to prevent rendering the layout for a split second before redirection.
  if (!currentUser) {
    return null;
  }

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  const canSeeManagementSection = managementMenuItems.some(item => 
    userRole?.permissions[item.permission]?.read
  );

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center gap-4 border-b bg-card px-6">
        <AppLogo />
        <div className="flex flex-1 items-center justify-end gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={currentUser.avatarUrl || "https://placehold.co/40x40.png"}
                    alt={currentUser.name}
                    data-ai-hint="profile picture"
                  />
                  <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
                </Avatar>
                <div className="text-left hidden md:block">
                  <p className="font-medium text-sm text-card-foreground">{currentUser.name}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {userMenuItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
              
              {canSeeManagementSection && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Management</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {managementMenuItems.map((item) => {
                    const canRead = userRole?.permissions[item.permission]?.read;
                    if (canRead) {
                        return (
                            <DropdownMenuItem key={item.href} asChild>
                                <Link href={item.href}>
                                    <item.icon className="mr-2 h-4 w-4" />
                                    {item.label}
                                </Link>
                            </DropdownMenuItem>
                        );
                    }
                    return null;
                  })}
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LifeBuoy className="mr-2 h-4 w-4" />
                Support
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex-1 overflow-auto bg-muted/40 p-4 md:p-6">{children}</main>
    </div>
  );
}

    