
'use client';

import { useState } from 'react';
import type {Document} from '@/ai/flows/document-management';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app/sidebar-content';

export default function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [selectedVoice, setSelectedVoice] = useState('alloy');
    const [speakingRate, setSpeakingRate] = useState(1.0);

    const handleDocumentSelect = (doc: Document) => {
        // Create and dispatch a custom event with the document detail
        const event = new CustomEvent('document-select', { detail: doc });
        window.dispatchEvent(event);
    };

    // Add useEffect to listen for the custom event on the window object
    // This is a simple way to pass state from a deeply nested child (sidebar) to a page component
    // A more robust solution might involve React Context or a state management library like Zustand
    // if the application complexity grows.
    useEffect(() => {
        const page = document.querySelector('[data-page="app-main"]');
        if (!page) return;

        const handleSelect = (event: Event) => {
            const customEvent = event as CustomEvent<Document>;
            // Here you could update state or call a function in the main page
            // For now, we'll assume the page itself handles the logic
        };

        page.addEventListener('document-select', handleSelect);
        return () => {
            page.removeEventListener('document-select', handleSelect);
        };
    }, []);

    return (
        <div className="dark bg-background text-foreground min-h-screen">
            <SidebarProvider>
                <Sidebar>
                    <AppSidebar 
                         onDocumentSelect={handleDocumentSelect}
                         onVoiceChange={setSelectedVoice}
                         onRateChange={setSpeakingRate}
                         selectedVoice={selectedVoice}
                         speakingRate={speakingRate}
                    />
                </Sidebar>
                <SidebarInset>
                    <div data-page="app-main">
                         {/* Pass state down to children using React.cloneElement */}
                        {React.Children.map(children, child => {
                            if (React.isValidElement(child)) {
                                return React.cloneElement(child, { 
                                    selectedVoice, 
                                    speakingRate,
                                    handleDocumentSelect, // Pass the handler
                                } as React.Attributes);
                            }
                            return child;
                        })}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </div>
    )
}
