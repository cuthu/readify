
'use client';

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  UploadCloud,
  Mic,
  Gauge,
  LayoutDashboard,
} from 'lucide-react';
import { useState, useRef } from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { audioConversion } from '@/ai/flows/audio-conversion';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { AiTools } from './ai-tools';
import { DocumentList } from './document-list';
import type { Document } from '@/types/document';


const voices = {
  "Amazon": ["ivy", "joanna", "kendra", "kimberly", "salli", "joey", "justin", "matthew"],
  "OpenAI": ["alloy", "echo", "fable", "onyx", "nova", "shimmer"],
};


interface SidebarNavigationProps {
  onDocumentSelect: (doc: Document) => void;
  onDocumentDeleted: (deletedDocId: string) => void;
  onVoiceChange: (voice: string) => void;
  onRateChange: (rate: number) => void;
  selectedVoice: string;
  speakingRate: number;
  documentContent: string;
}

export function SidebarNavigation({
  onDocumentSelect,
  onDocumentDeleted,
  onVoiceChange,
  onRateChange,
  selectedVoice,
  speakingRate,
  documentContent,
}: SidebarNavigationProps) {
  const { isUser } = useAuth();
  const [isPreviewingVoice, setIsPreviewingVoice] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const isAiToolsDisabled = !documentContent;


  const handlePreviewVoice = async (e: React.MouseEvent, voice: string) => {
    e.stopPropagation();
    if (isPreviewingVoice) return;
    
    setIsPreviewingVoice(voice);
    try {
        const result = await audioConversion({ text: "Hello, this is a preview of the selected voice.", voiceName: voice });
        if (previewAudioRef.current) {
            previewAudioRef.current.src = result.audioDataUri;
            previewAudioRef.current.play();
        }
    } catch (error) {
        console.error('Error generating voice preview:', error);
        toast({
            title: 'Preview Error',
            description: 'Could not generate voice preview.',
            variant: 'destructive',
        });
        setIsPreviewingVoice(null); // Reset on error
    }
  };

  return (
    <SidebarMenu>
      {/* Hidden audio element for previews */}
      <audio ref={previewAudioRef} onEnded={() => setIsPreviewingVoice(null)} className="hidden" />

      <SidebarMenuItem>
        <SidebarMenuButton onClick={() => document.getElementById('file-upload')?.click()}>
          <UploadCloud />
          Upload New Document
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
         <div className="flex flex-col gap-2 px-2 pt-2">
            <Label htmlFor="voice-select-sidebar" className="flex items-center gap-2 text-sm font-medium">
                <Mic className="h-4 w-4" />
                Voice
            </Label>
            <Select value={selectedVoice} onValueChange={onVoiceChange}>
                <SelectTrigger id="voice-select-sidebar" className="w-full h-8 text-xs">
                    <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(voices).map(([provider, voiceList]) => (
                        <div key={provider}>
                            <Label className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{provider}</Label>
                            {voiceList.map(voice => (
                                <SelectItem key={voice} value={voice}>
                                    <div className="flex items-center justify-between w-full">
                                        <span>{voice.charAt(0).toUpperCase() + voice.slice(1)}</span>
                                        <button onClick={(e) => handlePreviewVoice(e, voice)} disabled={!!isPreviewingVoice} className="p-1">
                                          {isPreviewingVoice === voice ? (
                                              <span className="h-4 w-4 animate-spin border-2 border-current border-t-transparent rounded-full inline-block" />
                                          ) : (
                                              <span className="lucide lucide-volume-2 h-4 w-4 text-muted-foreground hover:text-foreground" />
                                          )}
                                        </button>
                                    </div>
                                </SelectItem>
                            ))}
                        </div>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <div className="flex flex-col gap-2 px-2 pt-2">
            <div className='flex items-center justify-between'>
                 <Label htmlFor="speaking-rate" className="flex items-center gap-2 text-sm font-medium">
                    <Gauge className="h-4 w-4" />
                    Speaking Rate
                </Label>
                <span className="text-xs text-muted-foreground font-mono">{speakingRate.toFixed(1)}x</span>
            </div>
          <Slider
            id="speaking-rate"
            min={0.5}
            max={2}
            step={0.1}
            value={[speakingRate]}
            onValueChange={(value) => onRateChange(value[0])}
          />
        </div>
      </SidebarMenuItem>

      <AiTools isAiToolsDisabled={isAiToolsDisabled} />

      <DocumentList onDocumentSelect={onDocumentSelect} onDocumentDeleted={onDocumentDeleted} />
      
      {!isUser() && (
        <SidebarMenuItem>
            <Link href="/admin" passHref>
                <SidebarMenuButton asChild>
                    <span>
                        <LayoutDashboard />
                        Admin Dashboard
                    </span>
                </SidebarMenuButton>
            </Link>
        </SidebarMenuItem>
      )}
    </SidebarMenu>
  );
}
