import { AdminNav } from '@/components/admin/admin-nav';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="dark bg-background text-foreground min-h-screen p-4">
            <div className="container mx-auto">
                <h1 className="text-2xl font-bold font-headline mb-4">Admin Panel</h1>
                <AdminNav />
                <div className="mt-4">
                    {children}
                </div>
            </div>
        </div>
    )
}
