
'use client';

import { useState, useCallback, memo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Configure the worker to render PDFs from a CDN
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DocumentViewerProps {
  file: File | string;
  scale: number;
  onTextExtracted: (text: string) => void;
}

const MemoizedPage = memo(Page);

export function DocumentViewer({ file, scale, onTextExtracted }: DocumentViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);

  const onDocumentLoadSuccess = useCallback(async (pdf: any): Promise<void> => {
    setNumPages(pdf.numPages);
    
    // Only extract text from PDF files, as other types are handled elsewhere
    if (typeof file === 'string' && !file.endsWith('.pdf')) return;
    if (file instanceof File && file.type !== 'application/pdf') return;

    try {
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map((item: any) => item.str).join(' ');
      }
      onTextExtracted(fullText);
    } catch (error) {
      console.error("Failed to extract text from PDF:", error);
      onTextExtracted(''); // Clear content on error
    }
  }, [file, onTextExtracted]);

  return (
    <div className="flex-1 w-full rounded-lg border bg-secondary/20 p-4">
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
          className="flex flex-col items-center gap-4"
      >
          {Array.from(new Array(numPages), (el, index) => (
            <Card key={`page_${index + 1}`} className="overflow-hidden shadow-lg">
                <CardContent className="p-0">
                    <MemoizedPage
                        pageNumber={index + 1}
                        scale={scale}
                        renderTextLayer
                        renderAnnotationLayer
                        loading=""
                    />
                </CardContent>
            </Card>
          ))}
      </Document>
    </div>
  );
}
