
'use client';

import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

// Configure the worker to render PDFs
// The path is configured in next.config.ts
pdfjs.GlobalWorkerOptions.workerSrc = '/static/chunks/pdf.worker.min.mjs';


interface DocumentViewerProps {
  file: File | string;
}

export function DocumentViewer({ file }: DocumentViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }): void => {
    setNumPages(numPages);
    setPageNumber(1);
  };
  
  const goToPrevPage = () => setPageNumber(prevPageNumber => Math.max(prevPageNumber - 1, 1));
  const goToNextPage = () => setPageNumber(prevPageNumber => Math.min(prevPageNumber + 1, numPages || 1));
  
  const zoomIn = () => setScale(prevScale => Math.min(prevScale + 0.1, 2.0));
  const zoomOut = () => setScale(prevScale => Math.max(prevScale - 0.1, 0.5));


  return (
    <div className="flex flex-col h-full items-center gap-4">
      {/* Top controls for navigation and zoom */}
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
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={zoomOut} disabled={scale <= 0.5}>
                        <ZoomOut className="h-5 w-5" />
                    </Button>
                    <span className="text-sm font-medium w-12 text-center">{(scale * 100).toFixed(0)}%</span>
                     <Button variant="ghost" size="icon" onClick={zoomIn} disabled={scale >= 2.0}>
                        <ZoomIn className="h-5 w-5" />
                    </Button>
                </div>
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
