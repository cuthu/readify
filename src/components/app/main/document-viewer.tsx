
'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

// Configure the worker to render PDFs
// The path is configured in next.config.ts
pdfjs.GlobalWorkerOptions.workerSrc = '/static/chunks/pdf.worker.min.mjs';


interface DocumentViewerProps {
  file: File | string;
  scale: number;
}

export function DocumentViewer({ file, scale }: DocumentViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }): void => {
    setNumPages(numPages);
    setPageNumber(1);
  };
  
  const goToPrevPage = () => setPageNumber(prevPageNumber => Math.max(prevPageNumber - 1, 1));
  const goToNextPage = () => setPageNumber(prevPageNumber => Math.min(prevPageNumber + 1, numPages || 1));
  

  return (
    <div className="flex flex-col h-full items-center gap-4">
      {/* Top controls for navigation */}
      {numPages && (
         <Card className="w-full">
            <CardContent className="p-2 flex items-center justify-center gap-4">
                <Button variant="ghost" size="icon" onClick={goToPrevPage} disabled={pageNumber <= 1}>
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <span className="text-sm font-medium">
                    Page {pageNumber} of {numPages}
                </span>
                <Button variant="ghost" size="icon" onClick={goToNextPage} disabled={pageNumber >= numPages}>
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </CardContent>
        </Card>
      )}

      {/* The PDF Document */}
      <div className="flex-1 w-full overflow-auto rounded-lg border">
         <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
                <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="ml-4 text-muted-foreground">Loading document...</p>
                </div>
            }
            error={
                 <div className="flex justify-center items-center h-full text-destructive">
                    <p>Failed to load PDF file. Please try another document.</p>
                </div>
            }
        >
            <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer
                renderAnnotationLayer
                loading="" // Disable default page loader
            />
        </Document>
      </div>

    </div>
  );
}
