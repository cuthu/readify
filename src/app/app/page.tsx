
'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SummarizeDialog } from '@/components/app/main/summarize-dialog';
import { LearnDialog } from '@/components/app/main/learn-dialog';
import { TtsTab } from '@/components/app/main/tts-tab';
import { UploadTab } from '@/components/app/main/upload-tab';
import { addDocument, uploadDocument } from '@/ai/flows/document-management';
import { Document } from '@/types/document';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app/sidebar-content';
import * as pdfjs from 'pdfjs-dist';
import { renderAsync } from 'docx-preview';

// Set up the worker for pdfjs-dist
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}


export default function App() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [documentContent, setDocumentContent] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const [speakingRate, setSpeakingRate] = useState(1.0);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const { toast } = useToast();
  
  const saveDocument = async (name: string, content: string, url: string) => {
    try {
      await addDocument({ name, content, url });
      toast({
        title: 'Success!',
        description: `"${name}" has been uploaded and saved.`,
      });
      // This custom event will trigger a refresh in the sidebar
      window.dispatchEvent(new CustomEvent('document-added'));
      return true;
    } catch (error) {
       toast({
        title: 'Error Saving Document',
        description: 'There was a problem saving your document.',
        variant: 'destructive'
      });
      return false;
    }
  }

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument(arrayBuffer).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(' ');
    }
    return text;
  };

  const extractTextFromDocx = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const tempDiv = document.createElement('div');
    await renderAsync(arrayBuffer, tempDiv);
    return tempDiv.innerText;
  };


  const handleFileChange = async (file: File | null) => {
    if (file && (file.type === 'application/pdf' || file.type === 'text/plain' || file.name.endsWith('.docx'))) {
      setUploadedFile(file);
      setDocumentContent('');
      
      let content = '';
      setIsProcessingFile(true);

      try {
        if (file.type === 'text/plain') {
          content = await file.text();
        } else if (file.type === 'application/pdf') {
          content = await extractTextFromPdf(file);
        } else if (file.name.endsWith('.docx')) {
          content = await extractTextFromDocx(file);
        } else {
            toast({
              title: 'Unsupported File Type',
              description: 'Currently, only .txt, .pdf, and .docx files can be processed.',
              variant: 'destructive'
            });
            setIsProcessingFile(false);
            return;
        }

        setDocumentContent(content);

        // Upload the file to Vercel Blob
        const formData = new FormData();
        formData.append('file', file);
        const { url } = await uploadDocument(formData);

        if (!url) {
            throw new Error('File upload failed.');
        }

        const saved = await saveDocument(file.name, content, url);
        if (saved) {
          setActiveTab('tts'); // Switch to TTS tab after successful upload
        }
      } catch(e: any) {
          toast({
            title: 'Error Processing File',
            description: e.message || 'There was a problem reading or uploading your file.',
            variant: 'destructive'
          });
      } finally {
        setIsProcessingFile(false);
      }
    } else {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a .pdf, .txt, or .docx file.',
        variant: 'destructive',
      });
      setUploadedFile(null);
      setDocumentContent('');
    }
  };
  
  const handleDocumentSelect = (doc: Document) => {
    if (doc.content) {
      setDocumentContent(doc.content);
      setActiveTab('tts');
      toast({
        title: 'Document Loaded',
        description: `"${doc.name}" is ready for audio generation and AI tools.`,
      })
    } else {
       toast({
        title: 'No Content',
        description: `This document does not have any content to display.`,
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
            <div data-page="app-main" className="p-4 flex flex-col gap-4">
                {/* AI Tool Dialogs */}
                <SummarizeDialog documentContent={documentContent} />
                <LearnDialog documentContent={documentContent} />
                
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
                            uploadedFile={uploadedFile}
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
            </div>
        </SidebarInset>
    </SidebarProvider>
  );
}
