
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Loader2, FileQuestion, MessageSquare, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { interactiveLearning } from '@/ai/flows/interactive-learning';

export default function LearnPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [documentContent, setDocumentContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [quiz, setQuiz] = useState('');
  const [chatQuery, setChatQuery] = useState('');
  const [chatAnswer, setChatAnswer] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (file: File | null) => {
    if (file && (file.type === 'application/pdf' || file.type.includes('document') || file.type === 'text/plain')) {
      setUploadedFile(file);
      setQuiz('');
      setChatAnswer('');
      setChatQuery('');
      
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = async (event) => {
            setDocumentContent(event.target?.result as string);
        };
        reader.readAsText(file);
      } else {
        setDocumentContent('');
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

  const handleGenerateQuiz = async () => {
    if (!documentContent) return;

    setIsProcessing(true);
    setQuiz('');
    try {
        const result = await interactiveLearning({ documentContent });
        setQuiz(result.quiz);
    } catch (error) {
        console.error('Error generating quiz:', error);
        toast({
            title: 'Error',
            description: 'Failed to generate the quiz. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setIsProcessing(false);
    }
  }

  const handleChat = async () => {
    if (!documentContent || !chatQuery) return;
    setIsChatting(true);
    setChatAnswer('');

    try {
        const result = await interactiveLearning({ documentContent, query: chatQuery });
        setChatAnswer(result.answer || 'No answer found.');
    } catch (error) {
        console.error('Error chatting with document:', error);
        toast({
            title: 'Error',
            description: 'Failed to get an answer. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setIsChatting(false);
    }
  }

  return (
    <main className="p-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-1 space-y-4">
                    <Card>
                    <CardHeader>
                        <CardTitle>Interactive Learning</CardTitle>
                        <CardDescription>Upload a document to chat with it or generate a quiz.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div
                            onDragEnter={onDragEnter}
                            onDragLeave={onDragLeave}
                            onDragOver={onDragOver}
                            onDrop={onDrop}
                            className={cn("flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 bg-muted/20 text-center transition-colors hover:border-primary", { "border-primary bg-primary/10": isDragging })}
                        >
                            <input type="file" id="file-upload-learn" className="hidden" accept=".pdf,.docx,.txt" onChange={onFileSelect} />
                            <label htmlFor="file-upload-learn" className="flex flex-col items-center gap-2 text-muted-foreground cursor-pointer">
                                <Upload className="h-8 w-8" />
                                {uploadedFile ? (
                                    <p>{uploadedFile.name}</p>
                                ) : (
                                    <p>Click to browse or drag & drop</p>
                                )}
                            </label>
                        </div>
                    </CardContent>
                </Card>
                    <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" /> Chat with Document
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                            <div className="space-y-2">
                            <Input 
                                placeholder="Ask a question about the document..."
                                value={chatQuery}
                                onChange={(e) => setChatQuery(e.target.value)}
                                disabled={!documentContent}
                            />
                            <Button className="w-full" disabled={!documentContent || !chatQuery || isChatting} onClick={handleChat}>
                                {isChatting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isChatting ? 'Thinking...' : 'Ask'}
                                <Send className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                        {chatAnswer && (
                            <div className="p-4 bg-muted/50 rounded-lg text-sm">
                                <p className="font-semibold">Answer:</p>
                                <p>{chatAnswer}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
                <div className="lg:col-span-2">
                    <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileQuestion className="h-5 w-5" /> Generated Quiz
                            </div>
                            <Button size="sm" disabled={!documentContent || isProcessing} onClick={handleGenerateQuiz}>
                                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isProcessing ? 'Generating...' : 'Generate New Quiz'}
                                </Button>
                        </CardTitle>
                        <CardDescription>A quiz based on the content of your document.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isProcessing && !quiz && <p className="text-muted-foreground">Generating quiz...</p>}
                        {quiz ? (
                            <div className="text-sm whitespace-pre-wrap p-4 bg-muted/50 rounded-lg">{quiz}</div>
                        ) : (
                            !isProcessing && <p className="text-muted-foreground text-center py-8">Your generated quiz will appear here.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    </main>
  );
}
