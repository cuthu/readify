
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
  Loader2,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Document, getDocuments, deleteDocument } from '@/ai/flows/document-management';
import { useToast } from '@/hooks/use-toast';
import { audioConversion } from '@/ai/flows/audio-conversion';

const voices = {
  "OpenAI": ["alloy", "echo", "fable", "onyx", "nova", "shimmer"],
  "Amazon": ["ivy", "joanna", "kendra"],
};

const openDialog = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
        element.click();
    }
}

interface SidebarNavigationProps {
  onDocumentSelect: (doc: Document) => void;
  onVoiceChange: (voice: string) => void;
  onRateChange: (rate: number) => void;
  selectedVoice: string;
  speakingRate: number;
}

export function SidebarNavigation({
  onDocumentSelect,
  onVoiceChange,
  onRateChange,
  selectedVoice,
  speakingRate
}: SidebarNavigationProps) {
  const [aiToolsOpen, setAiToolsOpen] = useState(true);
  const [myDocsOpen, setMyDocsOpen] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isPreviewingVoice, setIsPreviewingVoice] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const fetchDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      const docs = await getDocuments();
      setDocuments(docs);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not fetch your documents.',
        variant: 'destructive',
      });
      console.error(error);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    // Listen for the custom event to refresh documents
    const handleDocAdded = () => fetchDocuments();
    window.addEventListener('document-added', handleDocAdded);
    return () => {
        window.removeEventListener('document-added', handleDocAdded);
    }
  }, []);

  const handleDeleteDocument = async (e: React.MouseEvent, docId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleting(docId);
    try {
      await deleteDocument(docId);
      toast({
        title: 'Success',
        description: 'Document deleted.',
      });
      fetchDocuments(); // Refresh the list
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not delete the document.',
        variant: 'destructive',
      });
      console.error(error);
    } finally {
      setIsDeleting(null);
    }
  };

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
                                        {isPreviewingVoice === voice ? (
                                          <Loader2 className="ml-4 h-4 w-4 animate-spin" />
                                        ) : (
                                          <Volume2
                                            className="ml-4 h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer"
                                            onClick={(e) => handlePreviewVoice(e, voice)}
                                          />
                                        )}
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
                  <SidebarMenuSubButton onClick={() => openDialog('learn-dialog-trigger')}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span>Chat with Document</span>
                  </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => openDialog('summarize-dialog-trigger')}>
                      <List className="mr-2 h-4 w-4" />
                      <span>Summarize & Key Points</span>
                  </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => openDialog('summarize-dialog-trigger')}>
                      <Book className="mr-2 h-4 w-4" />
                      <span>Create Glossary</span>
                  </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => openDialog('learn-dialog-trigger')}>
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
              {isLoadingDocs ? (
                 <div className="flex justify-center items-center p-2"><Loader2 className="h-4 w-4 animate-spin" /></div>
              ) : documents.length > 0 ? (
                documents.map(doc => (
                  <SidebarMenuSubItem key={doc.id}>
                    <SidebarMenuSubButton onClick={() => onDocumentSelect(doc)}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span className="truncate">{doc.name}</span>
                        {isDeleting === doc.id ? (
                          <Loader2 className="ml-auto h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2
                            className="ml-auto h-4 w-4 text-muted-foreground transition-colors hover:text-destructive"
                            onClick={(e) => handleDeleteDocument(e, doc.id)}
                          />
                        )}
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))
              ) : (
                <p className="px-4 py-2 text-xs text-muted-foreground">No documents found.</p>
              )}
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
