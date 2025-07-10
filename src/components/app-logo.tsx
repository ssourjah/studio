'use client';
import { BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { useSettings } from '@/context/SettingsContext';
import Image from 'next/image';

interface AppLogoProps {
  showName?: boolean;
}

export function AppLogo({ showName = true }: AppLogoProps) {
  const { companyName, logoUrl } = useSettings();

  return (
    <Link href="/dashboard" className="flex items-center gap-2.5 text-foreground font-bold text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-2 -ml-2 mr-6">
      <div className="bg-transparent flex items-center justify-center h-9">
        {logoUrl ? (
          <Image src={logoUrl} alt={`${companyName} Logo`} width={64} height={36} className="object-contain h-9 w-auto" />
        ) : (
          <div className="bg-primary p-2 rounded-lg flex items-center justify-center h-9 w-9">
             <BarChart3 className="h-5 w-5 text-primary-foreground" />
          </div>
        )}
      </div>
      {showName && <span className="font-headline">TaskMaster Pro</span>}
    </Link>
  );
}
