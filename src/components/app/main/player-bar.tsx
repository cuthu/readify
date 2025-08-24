
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Rewind, Play, Pause, FastForward, Loader2, Mic, ZoomIn, ZoomOut } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface PlayerBarProps {
  onGenerateAudio: () => void;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  isPlaying: boolean;
  isGenerating: boolean;
  isReadyForAudio: boolean;
  hasAudio: boolean;
  duration: number;
  currentTime: number;
}

function formatTime(seconds: number) {
    if (isNaN(seconds) || seconds === Infinity) {
        return '00:00';
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function PlayerBar({
  onGenerateAudio,
  onPlayPause,
  onSeek,
  onZoomIn,
  onZoomOut,
  isPlaying,
  isGenerating,
  isReadyForAudio,
  hasAudio,
  duration,
  currentTime,
}: PlayerBarProps) {

  return (
    <div className="flex-shrink-0 mt-4">
      <Card>
        <CardContent className="p-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" disabled={!hasAudio} onClick={() => onSeek(Math.max(0, currentTime - 10))}>
                    <Rewind className="h-5 w-5" />
                </Button>
                 <Button variant="ghost" size="icon" onClick={onPlayPause} disabled={!hasAudio}>
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
                <Button variant="ghost" size="icon" disabled={!hasAudio} onClick={() => onSeek(Math.min(duration, currentTime + 10))}>
                    <FastForward className="h-5 w-5" />
                </Button>
            </div>
            
            <div className="flex-1 flex items-center gap-3">
                <span className="text-xs font-mono">{formatTime(currentTime)}</span>
                <Slider 
                    value={[currentTime]} 
                    max={duration} 
                    step={1} 
                    disabled={!hasAudio}
                    onValueChange={(value) => onSeek(value[0])}
                />
                <span className="text-xs font-mono">{formatTime(duration)}</span>
            </div>

            <div className="flex items-center gap-2">
                 <Button variant="outline" size="icon" onClick={onZoomOut}>
                    <ZoomOut className="h-5 w-5" />
                </Button>
                 <Button variant="outline" size="icon" onClick={onZoomIn}>
                    <ZoomIn className="h-5 w-5" />
                </Button>
                <Button variant="default" className="w-40" disabled={isGenerating || !isReadyForAudio} onClick={onGenerateAudio}>
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
