
'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2, Mic } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { audioConversion } from '@/ai/flows/audio-conversion';
import { useToast } from '@/hooks/use-toast';

interface TtsTabProps {
  initialText: string;
  selectedVoice: string;
  speakingRate: number;
}

export function TtsTab({ initialText, selectedVoice, speakingRate }: TtsTabProps) {
  const [textToSpeechInput, setTextToSpeechInput] = useState(initialText);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setTextToSpeechInput(initialText);
  }, [initialText]);

  const handleGenerateAudio = async () => {
    setIsGeneratingAudio(true);
    setAudioDataUri(null);
    try {
      // NOTE: Speaking rate is not yet supported by the underlying API, but the value is passed here for future use.
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
    <Card>
      <CardHeader>
        <CardTitle>Text to Speech</CardTitle>
        <CardDescription>The content of your loaded document appears here. You can edit it before generating audio.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Upload or select a document, or paste your text here..."
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
            <audio controls src={audioDataUri} className="w-full" autoPlay>
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
