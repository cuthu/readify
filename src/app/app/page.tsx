
'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SummarizeDialog } from '@/components/app/main/summarize-dialog';
import { LearnDialog } from '@/components/app/main/learn-dialog';
import { TtsTab } from '@/components/app/main/tts-tab';
import { UploadTab } from '@/components/app/main/upload-tab';
import { uploadDocument, processAndSaveDocument } from '@/ai/flows/document-management';
import { Document } from '@/types/document';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app/sidebar-content';
import { useAuth } from '@/hooks/use-auth';
import { DocumentViewer } from '@/components/app/main/document-viewer';
import { PlayerBar } from '@/components/app/main/player-bar';


export default function App() {
  const { user } = useAuth();
  const [activeDocument, setActiveDocument] = useState<File | Document | null>(null);
  const [documentContent, setDocumentContent] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const [speakingRate, setSpeakingRate] = useState(1.0);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const { toast } = useToast();
  
  const handleFileChange = async (file: File | null) => {
    if (!file) return;
    if (!user) {
        toast({ title: 'Authentication Error', description: 'You must be logged in to upload files.', variant: 'destructive' });
        return;
    }

    if (!file.type.startsWith('text/plain') && !file.type.startsWith('application/pdf') && !file.name.endsWith('.docx')) {
       toast({
        title: 'Invalid File Type',
        description: 'Please upload a .pdf, .txt, or .docx file.',
        variant: 'destructive',
      });
      return;
    }

    // --- Immediate UI Update ---
    setActiveDocument(file);
    setDocumentContent(''); // Clear old content
    setIsProcessingFile(true);


    // --- Background Processing ---
    try {
      // Step 1: Upload the file to Vercel Blob storage
      const formData = new FormData();
      formData.append('file', file);
      const { url, error: uploadError } = await uploadDocument(formData);

      if (uploadError || !url) {
        throw new Error(uploadError || 'File upload failed.');
      }
      
      toast({
        title: 'Upload Complete',
        description: `Processing "${file.name}" in the background.`,
      });

      // Step 2: Trigger the backend flow to process the file
      const savedDoc = await processAndSaveDocument({ 
        fileName: file.name, 
        url,
        userId: user.id,
        userEmail: user.email,
      });

      // Step 3: Update the UI with the processed content
      setDocumentContent(savedDoc.content);

      toast({
        title: 'Ready to Go!',
        description: `"${savedDoc.name}" is now ready for all AI tools.`,
      });
      
      // This custom event will trigger a refresh in the sidebar
      window.dispatchEvent(new CustomEvent('document-added'));

    } catch(e: any) {
        toast({
          title: 'Error Processing File',
          description: e.message || 'There was a problem processing your file.',
          variant: 'destructive'
        });
        // If processing fails, reset the view
        setActiveDocument(null);
    } finally {
      setIsProcessingFile(false);
    }
  };
  
  const handleDocumentSelect = (doc: Document) => {
    setActiveDocument(doc);
    if (doc.content) {
      setDocumentContent(doc.content);
      toast({
        title: 'Document Loaded',
        description: `"${doc.name}" is ready for audio generation and AI tools.`,
      })
    } else {
       toast({
        title: 'No Content',
        description: `This document has no extracted text. AI tools may not work.`,
        variant: 'destructive',
      })
    }
  }


  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // This is necessary to allow dropping
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
        handleFileChange(files[0]);
    }
  };

  const getFileOrUrl = () => {
    if (!activeDocument) return '';
    return activeDocument instanceof File ? activeDocument : activeDocument.url;
  }

  return (
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
            <div data-page="app-main" className="p-4 flex flex-col gap-4 h-full">
                {/* AI Tool Dialogs */}
                <SummarizeDialog documentContent={documentContent} />
                <LearnDialog documentContent={documentContent} />
                
                {activeDocument ? (
                  <div className="flex-1 flex flex-col h-full min-h-0">
                    <DocumentViewer file={getFileOrUrl()} />
                    <PlayerBar />
                  </div>
                ) : (
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="upload">Upload Document</TabsTrigger>
                          <TabsTrigger value="tts">Text to Speech</TabsTrigger>
                      </TabsList>
                      <TabsContent value="upload">
                          <UploadTab 
                              onDragEnter={onDragEnter}
                              onDragLeave={onDragLeave}
                              onDragOver={onDragOver}
                              onDrop={onDrop}
                              onFileSelect={onFileSelect}
                              isDragging={isDragging}
                              isProcessing={isProcessingFile}
                              uploadedFile={activeDocument instanceof File ? activeDocument : null}
                          />
                      </TabsContent>
                      <TabsContent value="tts">
                          <TtsTab 
                              initialText={documentContent} 
                              selectedVoice={selectedVoice}
                              speakingRate={speakingRate}
                          />
                      </TabsContent>
                  </Tabs>
                )}
            </div>
        </SidebarInset>
    </SidebarProvider>
  );
}
