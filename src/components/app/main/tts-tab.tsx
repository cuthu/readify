
'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2, Mic, Volume2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { audioConversion } from '@/ai/flows/audio-conversion';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const voices = {
  "OpenAI": ["alloy", "echo", "fable", "onyx", "nova", "shimmer"],
  "Amazon": ["ivy", "joanna", "kendr"],
};

interface TtsTabProps {
  initialText: string;
}

export function TtsTab({ initialText }: TtsTabProps) {
  const [textToSpeechInput, setTextToSpeechInput] = useState(initialText);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const [isPreviewingVoice, setIsPreviewingVoice] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setTextToSpeechInput(initialText);
  }, [initialText]);

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
    } finally {
        setIsPreviewingVoice(null);
    }
  };

  return (
    <Card>
      <audio ref={previewAudioRef} onEnded={() => setIsPreviewingVoice(null)} />
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
        <Textarea
          placeholder="Upload a document or paste your text here..."
          rows={15}
          value={textToSpeechInput}
          onChange={(e) => setTextToSpeechInput(e.target.value)}
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
  );
}
