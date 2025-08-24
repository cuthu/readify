'use client';

import { useState } from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, Loader2, Mic } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AppSidebar } from '@/components/app/sidebar-content';
import { audioConversion } from '@/ai/flows/audio-conversion';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const voices = {
  "OpenAI": ["alloy", "echo", "fable", "onyx", "nova", "shimmer"],
  "Amazon": ["ivy", "joanna", "kendr"],
};

export default function App() {
  const [textToSpeechInput, setTextToSpeechInput] = useState('');
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const { toast } = useToast();

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


  return (
    <div className="dark bg-background text-foreground min-h-screen">
      <SidebarProvider>
        <Sidebar>
          <AppSidebar />
        </Sidebar>
        <SidebarInset>
          <main className="p-4">
            <Tabs defaultValue="text-to-speech">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </TabsTrigger>
                <TabsTrigger value="text-to-speech">
                  <FileText className="mr-2 h-4 w-4" />
                  Text to Speech
                </TabsTrigger>
              </TabsList>
              <TabsContent value="upload">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Document</CardTitle>
                    <CardDescription>Upload a .pdf or .docx file to get started.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="flex h-32 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 bg-muted/20 text-center transition-colors hover:border-primary">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Upload className="h-8 w-8" />
                            <p>Click to browse or drag & drop</p>
                        </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="text-to-speech">
                <Card>
                  <CardHeader>
                    <CardTitle>Text to Speech</CardTitle>
                    <CardDescription>Paste text below and generate audio.</CardDescription>
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
                                                <div className="flex items-center gap-2">
                                                    <span>{voice.charAt(0).toUpperCase() + voice.slice(1)}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </div>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Textarea
                      placeholder="Paste your text here..."
                      rows={10}
                      value={textToSpeechInput}
                      onChange={(e) => setTextToSpeechInput(e.target.value)}
                    />
                    <Button onClick={handleGenerateAudio} disabled={isGeneratingAudio || !textToSpeechInput}>
                      {isGeneratingAudio && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isGeneratingAudio ? 'Generating...' : 'Generate Audio'}
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
              </TabsContent>
            </Tabs>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
