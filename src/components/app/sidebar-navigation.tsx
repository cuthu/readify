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

export function SidebarNavigation() {
  const [aiToolsOpen, setAiToolsOpen] = useState(false);
  const [myDocsOpen, setMyDocsOpen] = useState(true); // Default to open for visibility

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
        <SidebarMenuButton>
          <Gauge />
          Speaking Rate
        </SidebarMenuButton>
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
