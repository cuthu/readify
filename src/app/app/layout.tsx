import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app/sidebar-content';

export default function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="dark bg-background text-foreground min-h-screen">
            <SidebarProvider>
                <Sidebar>
                    <AppSidebar />
                </Sidebar>
                <SidebarInset>
                    {children}
                </SidebarInset>
            </SidebarProvider>
        </div>
    )
}
