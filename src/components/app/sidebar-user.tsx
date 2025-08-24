
'use client';

import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';

export function SidebarUser() {
  const { user } = useAuth();
  
  // Render nothing if user is not loaded yet
  if (!user) {
    return null;
  }

  const getInitials = (name: string) => {
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.toUpperCase() || 'U';
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton>
          <Avatar className="h-6 w-6">
            <AvatarImage src="https://placehold.co/100x100.png" alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="font-semibold text-sm">{user.name}</span>
            <span className="text-xs text-muted-foreground">{user.role}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
