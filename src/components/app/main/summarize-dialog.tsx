
'use client';

import { useState } from 'react';
import { Loader2, FileText, List, Book } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { summarizeDocument } from '@/ai/flows/document-summarization';

interface SummarizeDialogProps {
  documentContent: string;
}

export function SummarizeDialog({ documentContent }: SummarizeDialogProps) {
  const [isProcessingSummary, setIsProcessingSummary] = useState(false);
  const [summary, setSummary] = useState('');
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [glossary, setGlossary] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleGenerateSummary = async () => {
    if (!documentContent) return;

    setIsProcessingSummary(true);
    setSummary('');
    setKeyPoints([]);
    setGlossary({});

    try {
        const result = await summarizeDocument({ documentText: documentContent });
        setSummary(result.summary);
        setKeyPoints(result.keyPoints);
        setGlossary(result.glossary);
    } catch (error) {
        console.error('Error summarizing document:', error);
        toast({
            title: 'Error',
            description: 'Failed to summarize the document. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setIsProcessingSummary(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild id="summarize-dialog-trigger" className="hidden"></DialogTrigger>
      <DialogContent className="max-w-3xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Document Insights</DialogTitle>
          <DialogDescription>
            Summary, key points, and glossary generated from your document.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 overflow-auto pr-4">
          <Button onClick={handleGenerateSummary} disabled={isProcessingSummary || !documentContent}>
            {isProcessingSummary && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isProcessingSummary ? 'Generating...' : 'Generate Insights'}
          </Button>
          {isProcessingSummary && !summary && <p className="text-muted-foreground">Generating...</p>}
          
          {summary && <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><FileText className="h-5 w-5" /> Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{summary}</p>
            </CardContent>
          </Card>}
          {keyPoints.length > 0 && <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><List className="h-5 w-5" /> Key Points</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc pl-5">
                {keyPoints.map((point, index) => (
                  <li key={index} className="text-sm">{point}</li>
                ))}
              </ul>
            </CardContent>
          </Card>}
          {Object.keys(glossary).length > 0 && <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Book className="h-5 w-5" /> Glossary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(glossary).map(([term, definition]) => (
                  <div key={term}>
                    <p className="font-semibold text-sm">{term}</p>
                    <p className="text-muted-foreground text-sm">{definition}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
