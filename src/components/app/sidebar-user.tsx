'use client';

import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function SidebarUser() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton>
          <Avatar className="h-6 w-6">
            <AvatarImage src="https://placehold.co/100x100.png" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <span>My Account</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
