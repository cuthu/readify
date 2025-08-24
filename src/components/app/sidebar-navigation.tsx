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
} from 'lucide-react';
import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

export function SidebarNavigation() {
  const [aiToolsOpen, setAiToolsOpen] = useState(false);
  const [myDocsOpen, setMyDocsOpen] = useState(true); // Default to open for visibility
  const [speakingRate, setSpeakingRate] = useState(1.0);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton>
          <UploadCloud />
          Upload New Document
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton>
          <Mic />
          Voice
        </SidebarMenuButton>
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
              {/* AI Tool sub-items will go here */}
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
