
'use client';

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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useState } from 'react';

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

  const disabledTooltip = "Please upload and select a document first.";

  const ToolButton = ({ onClick, disabled, tooltip, children }: { onClick: () => void, disabled: boolean, tooltip: string, children: React.ReactNode }) => (
     <Tooltip>
        <TooltipTrigger asChild>
             {/* We need a div wrapper for the tooltip to work correctly on disabled buttons */}
            <div className="w-full">
                <SidebarMenuSubButton onClick={onClick} disabled={disabled}>
                    {children}
                </SidebarMenuSubButton>
            </div>
        </TooltipTrigger>
        <TooltipContent side="right" align="center">
            {disabled ? disabledTooltip : tooltip}
        </TooltipContent>
    </Tooltip>
  )

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
                 <ToolButton onClick={() => openDialog('learn-dialog-trigger')} disabled={isAiToolsDisabled} tooltip="Chat with Document">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Chat with Document</span>
                </ToolButton>
            </SidebarMenuSubItem>
            <SidebarMenuSubItem>
                 <ToolButton onClick={() => openDialog('summarize-dialog-trigger')} disabled={isAiToolsDisabled} tooltip="Summarize & Key Points">
                    <List className="mr-2 h-4 w-4" />
                    <span>Summarize & Key Points</span>
                </ToolButton>
            </SidebarMenuSubItem>
            <SidebarMenuSubItem>
                <ToolButton onClick={() => openDialog('summarize-dialog-trigger')} disabled={isAiToolsDisabled} tooltip="Create Glossary">
                    <Book className="mr-2 h-4 w-4" />
                    <span>Create Glossary</span>
                </ToolButton>
            </SidebarMenuSubItem>
            <SidebarMenuSubItem>
                <ToolButton onClick={() => openDialog('learn-dialog-trigger')} disabled={isAiToolsDisabled} tooltip="Generate Quiz">
                    <FileQuestion className="mr-2 h-4 w-4" />
                    <span>Generate Quiz</span>
                </ToolButton>
            </SidebarMenuSubItem>
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    </SidebarGroup>
  );
}
