import { BarChart3 } from 'lucide-react';
import Link from 'next/link';

export function AppLogo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5 text-primary-foreground font-bold text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-2 -ml-2">
      <div className="bg-primary-foreground/20 p-2 rounded-lg">
        <BarChart3 className="h-5 w-5 text-primary-foreground" />
      </div>
      <span className="font-headline hidden group-data-[state=expanded]:block">TaskMaster Pro</span>
    </Link>
  );
}
