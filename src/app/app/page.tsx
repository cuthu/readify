
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SummarizeDialog } from '@/components/app/main/summarize-dialog';
import { LearnDialog } from '@/components/app/main/learn-dialog';
import { TtsTab } from '@/components/app/main/tts-tab';
import { UploadTab } from '@/components/app/main/upload-tab';
import { uploadDocument, processAndSaveDocument } from '@/ai/flows/document-management';
import { audioConversion } from '@/ai/flows/audio-conversion';
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
  
  // New state for audio player
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // New state for document viewer zoom
  const [scale, setScale] = useState(1.0);

  const { toast } = useToast();
  
  const handleFileChange = async (file: File | null) => {
    if (!file) return;
    if (!user) {
        toast({ title: 'Authentication Error', description: 'You must be logged in to upload files.', variant: 'destructive' });
        return;
    }

    if (!file.type.startsWith('application/pdf') && !file.type.endsWith('.docx') && !file.type.endsWith('.txt')) {
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
    resetAudioState();
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
    setDocumentContent(doc.content || '');
    resetAudioState();
    if (doc.content) {
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

  const handleGenerateAudio = async () => {
    if (!documentContent) {
        toast({ title: 'No Content', description: 'There is no text to generate audio from.', variant: 'destructive' });
        return;
    }
    setIsGeneratingAudio(true);
    resetAudioState();
    try {
        const result = await audioConversion({ text: documentContent, voiceName: selectedVoice });
        setAudioDataUri(result.audioDataUri);
        toast({ title: 'Success', description: 'Audio generated successfully.' });
    } catch (error) {
        toast({ title: 'Audio Generation Failed', description: 'Could not generate audio. Please try again.', variant: 'destructive' });
        console.error("Audio generation error", error);
    } finally {
        setIsGeneratingAudio(false);
    }
  };

  const resetAudioState = () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setAudioDataUri(null);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
  }

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  const handleSeek = (time: number) => {
    if (audioRef.current) {
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
        setDuration(audioRef.current.duration);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', () => setIsPlaying(false));
        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', () => setIsPlaying(false));
        };
    }
  }, [audioDataUri]);


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
    return activeDocument instanceof File ? URL.createObjectURL(activeDocument) : activeDocument.url;
  }

  const isDocumentReadyForAudio = !!documentContent && !isProcessingFile;

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
                    <DocumentViewer file={getFileOrUrl()} scale={scale} />
                     <PlayerBar 
                        onGenerateAudio={handleGenerateAudio}
                        onPlayPause={handlePlayPause}
                        onSeek={handleSeek}
                        onZoomIn={() => setScale(s => Math.min(s + 0.1, 2.0))}
                        onZoomOut={() => setScale(s => Math.max(s - 0.1, 0.5))}
                        isGenerating={isGeneratingAudio}
                        isReadyForAudio={isDocumentReadyForAudio}
                        hasAudio={!!audioDataUri}
                        isPlaying={isPlaying}
                        duration={duration}
                        currentTime={currentTime}
                     />
                     {audioDataUri && <audio ref={audioRef} src={audioDataUri} className="hidden" />}
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
