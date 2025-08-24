
'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SummarizeDialog } from '@/components/app/main/summarize-dialog';
import { LearnDialog } from '@/components/app/main/learn-dialog';
import { TtsTab } from '@/components/app/main/tts-tab';
import { UploadTab } from '@/components/app/main/upload-tab';
import { addDocument, Document } from '@/ai/flows/document-management';

export default function App() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [documentContent, setDocumentContent] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const [speakingRate, setSpeakingRate] = useState(1.0);
  const { toast } = useToast();

  const handleFileChange = (file: File | null) => {
    if (file && (file.type === 'application/pdf' || file.type.includes('document') || file.type === 'text/plain')) {
      setUploadedFile(file);
      setDocumentContent('');

       if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = async (event) => {
            const content = event.target?.result as string;
            setDocumentContent(content);
            try {
              await addDocument({ name: file.name, content });
              toast({
                title: 'Success!',
                description: `"${file.name}" has been uploaded and saved.`,
              });
               // This custom event will trigger a refresh in the sidebar
               window.dispatchEvent(new CustomEvent('document-added'));
            } catch (error) {
               toast({
                title: 'Error Saving Document',
                description: 'There was a problem saving your document.',
                variant: 'destructive'
              });
            }
            setActiveTab('tts'); // Switch to TTS tab after successful upload
        };
        reader.readAsText(file);
      } else {
        toast({
            title: 'Unsupported File Type for Now',
            description: 'Currently, only .txt files can be processed directly. Please convert your document to a text file.',
            variant: 'destructive'
        })
      }

    } else {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a .pdf, .docx, or .txt file.',
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
    <div className="p-4 flex flex-col gap-4">
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
  );
}
