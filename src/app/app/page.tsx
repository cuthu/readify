
'use client';

import { useState } from 'react';
import { Upload, FileText, Loader2, Mic, Volume2, Send, MessageSquare, List, Book, FileQuestion } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { audioConversion } from '@/ai/flows/audio-conversion';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { summarizeDocument } from '@/ai/flows/document-summarization';
import { interactiveLearning } from '@/ai/flows/interactive-learning';
import { Input } from '@/components/ui/input';


const voices = {
  "OpenAI": ["alloy", "echo", "fable", "onyx", "nova", "shimmer"],
  "Amazon": ["ivy", "joanna", "kendr"],
};

export default function App() {
  const [textToSpeechInput, setTextToSpeechInput] = useState('');
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [documentContent, setDocumentContent] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  // State for Summarize Dialog
  const [isProcessingSummary, setIsProcessingSummary] = useState(false);
  const [summary, setSummary] = useState('');
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [glossary, setGlossary] = useState<Record<string, string>>({});

  // State for Learn Dialog
  const [isProcessingQuiz, setIsProcessingQuiz] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [quiz, setQuiz] = useState('');
  const [chatQuery, setChatQuery] = useState('');
  const [chatAnswer, setChatAnswer] = useState('');


  const handleGenerateAudio = async () => {
    setIsGeneratingAudio(true);
    setAudioDataUri(null);
    try {
      const result = await audioConversion({ text: textToSpeechInput, voiceName: selectedVoice });
      setAudioDataUri(result.audioDataUri);
    } catch (error) {
      console.error('Error generating audio:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate audio. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleFileChange = (file: File | null) => {
    if (file && (file.type === 'application/pdf' || file.type.includes('document') || file.type === 'text/plain')) {
      setUploadedFile(file);
      setTextToSpeechInput('');
      setDocumentContent('');
      setSummary('');
      setKeyPoints([]);
      setGlossary({});
      setQuiz('');
      setChatAnswer('');

       if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = async (event) => {
            const content = event.target?.result as string;
            setDocumentContent(content);
            setTextToSpeechInput(content); // Pre-fill text-to-speech with document content
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
  
  const handlePreviewVoice = (e: React.MouseEvent, voice: string) => {
    e.stopPropagation();
    // Placeholder for voice preview functionality
    alert(`Previewing voice: ${voice}`);
  };

  const handleGenerateSummary = async () => {
    if (!documentContent) return;

    setIsProcessingSummary(true);
    setSummary('');
    setKeyPoints([]);
    setGlossary({});

    try {
        const result = await summarizeDocument({ documentText: documentContent });
        setSummary(result.summary);
        setKeyPoints(result.keyPoints);
        setGlossary(result.glossary);
    } catch (error) {
        console.error('Error summarizing document:', error);
        toast({
            title: 'Error',
            description: 'Failed to summarize the document. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setIsProcessingSummary(false);
    }
  }

  const handleGenerateQuiz = async () => {
    if (!documentContent) return;
    setIsProcessingQuiz(true);
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
        setIsProcessingQuiz(false);
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
        setChatQuery('');
    }
  }


  return (
    <main className="p-4 flex flex-col gap-4">
        {/* AI Tool Dialogs */}
        <Dialog>
            <DialogTrigger asChild id="summarize-dialog-trigger" className="hidden"></DialogTrigger>
            <DialogContent className="max-w-3xl h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Document Insights</DialogTitle>
                    <DialogDescription>
                        Summary, key points, and glossary generated from your document.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 overflow-auto pr-4">
                   <Button onClick={handleGenerateSummary} disabled={isProcessingSummary || !documentContent}>
                        {isProcessingSummary && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isProcessingSummary ? 'Generating...' : 'Generate Insights'}
                    </Button>
                    {isProcessingSummary && !summary && <p className="text-muted-foreground">Generating...</p>}
                    
                    {summary && <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg"><FileText className="h-5 w-5" /> Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm whitespace-pre-wrap">{summary}</p>
                        </CardContent>
                    </Card>}
                     {keyPoints.length > 0 && <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg"><List className="h-5 w-5" /> Key Points</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 list-disc pl-5">
                                {keyPoints.map((point, index) => (
                                    <li key={index} className="text-sm">{point}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>}
                    {Object.keys(glossary).length > 0 && <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg"><Book className="h-5 w-5" /> Glossary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {Object.entries(glossary).map(([term, definition]) => (
                                    <div key={term}>
                                        <p className="font-semibold text-sm">{term}</p>
                                        <p className="text-muted-foreground text-sm">{definition}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>}
                </div>
            </DialogContent>
        </Dialog>
        
        <Dialog>
            <DialogTrigger asChild id="learn-dialog-trigger" className="hidden"></DialogTrigger>
            <DialogContent className="max-w-3xl h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Interactive Learning</DialogTitle>
                    <DialogDescription>
                        Chat with your document or generate a quiz to test your knowledge.
                    </DialogDescription>
                </DialogHeader>
                 <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                    <div className="flex-1 overflow-auto pr-2 space-y-4">
                        {/* Quiz Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-lg">
                                        <FileQuestion className="h-5 w-5" /> Generated Quiz
                                    </div>
                                    <Button size="sm" disabled={!documentContent || isProcessingQuiz} onClick={handleGenerateQuiz}>
                                        {isProcessingQuiz && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {isProcessingQuiz ? 'Generating...' : 'New Quiz'}
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                 {isProcessingQuiz && !quiz && <p className="text-muted-foreground">Generating quiz...</p>}
                                {quiz ? (
                                    <div className="text-sm whitespace-pre-wrap p-4 bg-muted/50 rounded-lg max-h-60 overflow-auto">{quiz}</div>
                                ) : (
                                    !isProcessingQuiz && <p className="text-muted-foreground text-center py-4">Your generated quiz will appear here.</p>
                                )}
                            </CardContent>
                        </Card>
                        {/* Chat Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <MessageSquare className="h-5 w-5" /> Chat
                                </Title>
                            </CardHeader>
                            <CardContent>
                                 {chatAnswer && (
                                    <div className="p-4 bg-muted/50 rounded-lg text-sm mb-4">
                                        <p className="font-semibold">Answer:</p>
                                        <p>{chatAnswer}</p>
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <Input 
                                        placeholder="Ask a question..."
                                        value={chatQuery}
                                        onChange={(e) => setChatQuery(e.target.value)}
                                        disabled={!documentContent || isChatting}
                                        onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                                    />
                                    <Button disabled={!documentContent || !chatQuery || isChatting} onClick={handleChat}>
                                        {isChatting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </DialogContent>
        </Dialog>


        <Card>
            <CardHeader>
            <CardTitle>Upload Document</CardTitle>
            <CardDescription>Upload a .txt file to get started.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
                onDragOver={onDragOver}
                onDrop={onDrop}
                className={cn("flex h-32 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 bg-muted/20 text-center transition-colors hover:border-primary", { "border-primary bg-primary/10": isDragging })}
                >
                <input type="file" id="file-upload" className="hidden" accept=".txt" onChange={onFileSelect} />
                <label htmlFor="file-upload" className="flex flex-col items-center gap-2 text-muted-foreground cursor-pointer">
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
            <CardTitle>Text to Speech</CardTitle>
            <CardDescription>The content of your uploaded document appears here. You can edit it before generating audio.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="voice-select">Voice</Label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                    <SelectTrigger id="voice-select" className="w-full">
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
                                            <Volume2 className="ml-4 h-4 w-4 text-muted-foreground hover:text-foreground" onClick={(e) => handlePreviewVoice(e, voice)} />
                                        </div>
                                    </SelectItem>
                                ))}
                            </div>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <Textarea
                placeholder="Upload a .txt file or paste your text here..."
                rows={15}
                value={textToSpeechInput}
                onChange={(e) => setTextToSpeechInput(e.target.value)}
                disabled={!documentContent && !textToSpeechInput}
            />
            <Button onClick={handleGenerateAudio} disabled={isGeneratingAudio || !textToSpeechInput}>
                {isGeneratingAudio && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isGeneratingAudio ? 'Generating...' : 'Generate Audio'}
                <Mic className="ml-2 h-4 w-4" />
            </Button>
            {audioDataUri && (
                <div className="mt-4">
                <audio controls src={audioDataUri} className="w-full">
                    Your browser does not support the audio element.
                </audio>
                </div>
            )}
            </CardContent>
        </Card>
    </main>
  );
}
