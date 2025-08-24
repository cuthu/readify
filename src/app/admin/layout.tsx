
export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="dark bg-background text-foreground min-h-screen p-4">
            <div className="container mx-auto">
                {children}
            </div>
        </div>
    )
}
