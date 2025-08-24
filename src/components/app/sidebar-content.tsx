'use client';

import { SidebarContent, SidebarHeader, SidebarTrigger } from '@/components/ui/sidebar';
import { SidebarNavigation } from './sidebar-navigation';
import { SidebarUser } from './sidebar-user';
import { Separator } from '../ui/separator';

export function AppSidebar() {
  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <span className="font-headline text-lg">Readify</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="flex flex-col h-full">
          <div className="flex-1">
            <SidebarNavigation />
          </div>
          <div>
            <Separator className="my-2" />
            <SidebarUser />
          </div>
        </div>
      </SidebarContent>
    </>
  );
}
