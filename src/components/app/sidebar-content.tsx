
'use client';

import type {Document} from '@/ai/flows/document-management';
import { SidebarContent, SidebarHeader, SidebarTrigger } from '@/components/ui/sidebar';
import { SidebarNavigation } from './sidebar-navigation';
import { SidebarUser } from './sidebar-user';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface AppSidebarProps {
  onDocumentSelect: (doc: Document) => void;
  onVoiceChange: (voice: string) => void;
  onRateChange: (rate: number) => void;
  selectedVoice: string;
  speakingRate: number;
}


export function AppSidebar({
    onDocumentSelect,
    onVoiceChange,
    onRateChange,
    selectedVoice,
    speakingRate,
}: AppSidebarProps) {
  const { logout } = useAuth();

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
            <SidebarNavigation 
              onDocumentSelect={onDocumentSelect}
              onVoiceChange={onVoiceChange}
              onRateChange={onRateChange}
              selectedVoice={selectedVoice}
              speakingRate={speakingRate}
            />
          </div>
          <div>
            <Separator className="my-2" />
            <SidebarUser />
            <div className="px-2">
                <Button variant="ghost" className="w-full justify-start gap-2" onClick={logout}>
                    <LogOut className="h-4 w-4" />
                    <span>Log Out</span>
                </Button>
            </div>
          </div>
        </div>
      </SidebarContent>
    </>
  );
}
