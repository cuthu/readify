
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Rewind, Play, Pause, FastForward, Loader2, Mic, ZoomIn, ZoomOut } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface PlayerBarProps {
  // onGenerateAudio: () => void;
  // onPlayPause: () => void;
  // onSeek: (time: number) => void;
  // onZoomIn: () => void;
  // onZoomOut: () => void;
  // isPlaying: boolean;
  // isGenerating: boolean;
  // duration: number;
  // currentTime: number;
}

export function PlayerBar({}: PlayerBarProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <div className="flex-shrink-0 mt-4">
      <Card>
        <CardContent className="p-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                    <Rewind className="h-5 w-5" />
                </Button>
                 <Button variant="ghost" size="icon" onClick={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
                <Button variant="ghost" size="icon">
                    <FastForward className="h-5 w-5" />
                </Button>
            </div>
            
            <div className="flex-1 flex items-center gap-3">
                <span className="text-xs font-mono">00:00</span>
                <Slider defaultValue={[0]} max={100} step={1} disabled />
                <span className="text-xs font-mono">00:00</span>
            </div>

            <div className="flex items-center gap-2">
                 <Button variant="outline" size="icon">
                    <ZoomOut className="h-5 w-5" />
                </Button>
                 <Button variant="outline" size="icon">
                    <ZoomIn className="h-5 w-5" />
                </Button>
                <Button variant="default" className="w-40" disabled={isGenerating}>
                    {isGenerating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Mic className="mr-2 h-4 w-4" />
                    )}
                    {isGenerating ? 'Generating...' : 'Generate Audio'}
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
