'use client';

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarGroup,
} from '@/components/ui/sidebar';
import {
  UploadCloud,
  Mic,
  Gauge,
  Sparkles,
  Folder,
  Trash2,
  FileText,
  ChevronDown,
  LayoutDashboard,
  Volume2,
  MessageSquare,
  List,
  Book,
  FileQuestion,
} from 'lucide-react';
import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const voices = {
  "OpenAI": ["alloy", "echo", "fable", "onyx", "nova", "shimmer"],
  "Amazon": ["ivy", "joanna", "kendr"],
};

export function SidebarNavigation() {
  const [aiToolsOpen, setAiToolsOpen] = useState(false);
  const [myDocsOpen, setMyDocsOpen] = useState(true); // Default to open for visibility
  const [speakingRate, setSpeakingRate] = useState(1.0);
  const [selectedVoice, setSelectedVoice] = useState('alloy');

  const handlePreviewVoice = (e: React.MouseEvent, voice: string) => {
    e.stopPropagation();
    // Placeholder for voice preview functionality
    alert(`Previewing voice: ${voice}`);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton>
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
            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
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
                                        <Volume2 className="ml-4 h-4 w-4 text-muted-foreground hover:text-foreground" onClick={(e) => handlePreviewVoice(e, voice)} />
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
            defaultValue={[1]}
            onValueChange={(value) => setSpeakingRate(value[0])}
          />
        </div>
      </SidebarMenuItem>

      <SidebarGroup>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={() => setAiToolsOpen(!aiToolsOpen)} isActive={aiToolsOpen}>
            <Sparkles />
            AI Tools
            <ChevronDown
              className={`ml-auto h-4 w-4 transform transition-transform ${
                aiToolsOpen ? 'rotate-180' : ''
              }`}
            />
          </SidebarMenuButton>
          {aiToolsOpen && (
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="/app/learn">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span>Chat with Document</span>
                  </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="/app/summarize">
                      <List className="mr-2 h-4 w-4" />
                      <span>Summarize & Key Points</span>
                  </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="/app/summarize">
                      <Book className="mr-2 h-4 w-4" />
                      <span>Create Glossary</span>
                  </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="/app/learn">
                      <FileQuestion className="mr-2 h-4 w-4" />
                      <span>Generate Quiz</span>
                  </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          )}
        </SidebarMenuItem>
      </SidebarGroup>

       <SidebarGroup>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={() => setMyDocsOpen(!myDocsOpen)} isActive={myDocsOpen}>
            <Folder />
            My Documents
             <ChevronDown
              className={`ml-auto h-4 w-4 transform transition-transform ${
                myDocsOpen ? 'rotate-180' : ''
              }`}
            />
          </SidebarMenuButton>
          {myDocsOpen && (
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton href="#">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Document 1.pdf</span>
                    <Trash2 className="ml-auto h-4 w-4 text-muted-foreground transition-colors hover:text-destructive" />
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
               <SidebarMenuSubItem>
                <SidebarMenuSubButton href="#">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Research Paper.docx</span>
                    <Trash2 className="ml-auto h-4 w-4 text-muted-foreground transition-colors hover:text-destructive" />
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          )}
        </SidebarMenuItem>
      </SidebarGroup>
       <SidebarMenuItem>
        <SidebarMenuButton>
          <LayoutDashboard />
          Admin Dashboard
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
