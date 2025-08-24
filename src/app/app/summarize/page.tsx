
'use client';

import { useState } from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app/sidebar-content';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, FileText, List, Book } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { summarizeDocument } from '@/ai/flows/document-summarization';

export default function SummarizePage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState('');
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [glossary, setGlossary] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (file: File | null) => {
    if (file && (file.type === 'application/pdf' || file.type.includes('document'))) {
      setUploadedFile(file);
      setSummary('');
      setKeyPoints([]);
      setGlossary({});
    } else {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a supported document type.',
        variant: 'destructive',
      });
      setUploadedFile(null);
    }
  };

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
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
    <div className="dark bg-background text-foreground min-h-screen">
      <SidebarProvider>
        <Sidebar>
          <AppSidebar />
        </Sidebar>
        <SidebarInset>
          <main className="p-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-1">
                     <Card>
                        <CardHeader>
                            <CardTitle>Summarize Document</CardTitle>
                            <CardDescription>Upload a document to generate a summary, key points, and a glossary.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div
                                onDragEnter={onDragEnter}
                                onDragLeave={onDragLeave}
                                onDragOver={onDragOver}
                                onDrop={onDrop}
                                className={cn("flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 bg-muted/20 text-center transition-colors hover:border-primary", { "border-primary bg-primary/10": isDragging })}
                            >
                                <input type="file" id="file-upload" className="hidden" accept=".pdf,.docx,.txt" onChange={onFileSelect} />
                                <label htmlFor="file-upload" className="flex flex-col items-center gap-2 text-muted-foreground cursor-pointer">
                                    <Upload className="h-8 w-8" />
                                    {uploadedFile ? (
                                        <p>{uploadedFile.name}</p>
                                    ) : (
                                        <p>Click to browse or drag & drop</p>
                                    )}
                                </label>
                            </div>
                            <Button className="w-full" disabled={!uploadedFile || isProcessing}>
                                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isProcessing ? 'Processing...' : 'Generate'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
                 <div className="lg:col-span-2 grid gap-4">
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" /> Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isProcessing && !summary && <p className="text-muted-foreground">Generating summary...</p>}
                            <p className="text-sm">{summary}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                             <CardTitle className="flex items-center gap-2">
                                <List className="h-5 w-5" /> Key Points
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isProcessing && keyPoints.length === 0 && <p className="text-muted-foreground">Extracting key points...</p>}
                            <ul className="space-y-2 list-disc pl-5">
                                {keyPoints.map((point, index) => (
                                    <li key={index} className="text-sm">{point}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Book className="h-5 w-5" /> Glossary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isProcessing && Object.keys(glossary).length === 0 && <p className="text-muted-foreground">Creating glossary...</p>}
                            <div className="space-y-2">
                                {Object.entries(glossary).map(([term, definition]) => (
                                    <div key={term}>
                                        <p className="font-semibold text-sm">{term}</p>
                                        <p className="text-muted-foreground text-sm">{definition}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
