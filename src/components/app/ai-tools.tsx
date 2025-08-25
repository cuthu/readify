
'use client';

import { useState } from 'react';
import {
  SidebarGroup,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import {
  Sparkles,
  ChevronDown,
  MessageSquare,
  List,
  Book,
  FileQuestion,
} from 'lucide-react';

const openDialog = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
        element.click();
    }
}

interface AiToolsProps {
  isAiToolsDisabled: boolean;
}

export function AiTools({ isAiToolsDisabled }: AiToolsProps) {
  const [aiToolsOpen, setAiToolsOpen] = useState(true);

  return (
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
                <SidebarMenuSubButton onClick={() => openDialog('learn-dialog-trigger')} disabled={isAiToolsDisabled}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Chat with Document</span>
                </SidebarMenuSubButton>
            </SidebarMenuSubItem>
            <SidebarMenuSubItem>
                <SidebarMenuSubButton onClick={() => openDialog('summarize-dialog-trigger')} disabled={isAiToolsDisabled}>
                    <List className="mr-2 h-4 w-4" />
                    <span>Summarize & Key Points</span>
                </SidebarMenuSubButton>
            </SidebarMenuSubItem>
            <SidebarMenuSubItem>
                <SidebarMenuSubButton onClick={() => openDialog('summarize-dialog-trigger')} disabled={isAiToolsDisabled}>
                    <Book className="mr-2 h-4 w-4" />
                    <span>Create Glossary</span>
                </SidebarMenuSubButton>
            </SidebarMenuSubItem>
            <SidebarMenuSubItem>
                <SidebarMenuSubButton onClick={() => openDialog('learn-dialog-trigger')} disabled={isAiToolsDisabled}>
                    <FileQuestion className="mr-2 h-4 w-4" />
                    <span>Generate Quiz</span>
                </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    </SidebarGroup>
  );
}
