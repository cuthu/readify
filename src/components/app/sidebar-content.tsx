
'use client';

import type {Document} from '@/ai/flows/document-management';
import { SidebarContent, SidebarHeader, SidebarTrigger } from '@/components/ui/sidebar';
import { SidebarNavigation } from './sidebar-navigation';
import { SidebarUser } from './sidebar-user';
import { Separator } from '../ui/separator';

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
          </div>
        </div>
      </SidebarContent>
    </>
  );
}
