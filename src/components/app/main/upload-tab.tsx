
'use client';

import { Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface UploadTabProps {
  onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isDragging: boolean;
  uploadedFile: File | null;
}

export function UploadTab({
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileSelect,
  isDragging,
  uploadedFile,
}: UploadTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
        <CardDescription>Upload a .txt file to get started. Support for .pdf and .docx coming soon.</CardDescription>
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
  );
}
