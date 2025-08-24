
import { AdminNav } from '@/components/admin/admin-nav';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="dark bg-background text-foreground min-h-screen p-4">
            <div className="container mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold font-headline">Admin Panel</h1>
                    <Button asChild variant="outline">
                        <Link href="/app" className="flex items-center gap-2">
                           <ArrowLeft className="h-4 w-4" /> Go to App
                        </Link>
                    </Button>
                </div>
                <AdminNav />
                <div className="mt-4">
                    {children}
                </div>
            </div>
        </div>
    )
}
