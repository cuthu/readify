
'use client';

import { Upload, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface UploadTabProps {
  onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  isDragging: boolean;
  isProcessing: boolean;
}

export function UploadTab({
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  isDragging,
  isProcessing,
}: UploadTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
        <CardDescription>Upload a .txt, .pdf, or .docx file to get started.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
          className={cn("flex h-32 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 bg-muted/20 text-center transition-colors hover:border-primary", { "border-primary bg-primary/10": isDragging })}
        >
          <label htmlFor="file-upload" className={cn("flex flex-col items-center gap-2 text-muted-foreground", isProcessing ? "cursor-not-allowed" : "cursor-pointer")}>
            {isProcessing ? (
                <>
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>Processing file...</p>
                </>
            ) : (
                <>
                    <Upload className="h-8 w-8" />
                    <p>Click to browse or drag & drop</p>
                </>
            )}
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
