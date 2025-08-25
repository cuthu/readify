

'use client';

// Note: The main sidebar logic has been moved to page.tsx to correctly handle state passing.
// This layout now only provides the root structure.

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="dark bg-background text-foreground min-h-screen">
            {children}
        </div>
    )
}
