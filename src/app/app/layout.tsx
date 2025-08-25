

'use client';

import type {Document} from '@/ai/flows/document-management';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar, type AppSidebarProps } from '@/components/app/sidebar-content';

interface AppLayoutProps {
    children: React.ReactNode;
    sidebarProps: AppSidebarProps;
}

export default function AppLayout({ children, sidebarProps }: AppLayoutProps) {
    
    return (
        <div className="dark bg-background text-foreground min-h-screen">
           <SidebarProvider>
                <Sidebar>
                    <AppSidebar {...sidebarProps} />
                </Sidebar>
                <SidebarInset>
                    {children}
                </SidebarInset>
            </SidebarProvider>
        </div>
    )
}
