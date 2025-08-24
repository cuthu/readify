
'use client';

import { useState } from 'react';
import { Loader2, FileQuestion, MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { interactiveLearning } from '@/ai/flows/interactive-learning';

interface LearnDialogProps {
  documentContent: string;
}

export function LearnDialog({ documentContent }: LearnDialogProps) {
  const [isProcessingQuiz, setIsProcessingQuiz] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [quiz, setQuiz] = useState('');
  const [chatQuery, setChatQuery] = useState('');
  const [chatAnswer, setChatAnswer] = useState('');
  const { toast } = useToast();

  const handleGenerateQuiz = async () => {
    if (!documentContent) return;
    setIsProcessingQuiz(true);
    setQuiz('');
    try {
        const result = await interactiveLearning({ documentContent });
        setQuiz(result.quiz);
    } catch (error) {
        console.error('Error generating quiz:', error);
        toast({
            title: 'Error',
            description: 'Failed to generate the quiz. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setIsProcessingQuiz(false);
    }
  }

  const handleChat = async () => {
    if (!documentContent || !chatQuery) return;
    setIsChatting(true);
    setChatAnswer('');

    try {
        const result = await interactiveLearning({ documentContent, query: chatQuery });
        setChatAnswer(result.answer || 'No answer found.');
    } catch (error) {
        console.error('Error chatting with document:', error);
        toast({
            title: 'Error',
            description: 'Failed to get an answer. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setIsChatting(false);
        setChatQuery('');
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild id="learn-dialog-trigger" className="hidden"></DialogTrigger>
      <DialogContent className="max-w-3xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Interactive Learning</DialogTitle>
          <DialogDescription>
            Chat with your document or generate a quiz to test your knowledge.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="flex-1 overflow-auto pr-2 space-y-4">
            {/* Quiz Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-lg">
                    <FileQuestion className="h-5 w-5" /> Generated Quiz
                  </div>
                  <Button size="sm" disabled={!documentContent || isProcessingQuiz} onClick={handleGenerateQuiz}>
                    {isProcessingQuiz && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isProcessingQuiz ? 'Generating...' : 'New Quiz'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isProcessingQuiz && !quiz && <p className="text-muted-foreground">Generating quiz...</p>}
                {quiz ? (
                  <div className="text-sm whitespace-pre-wrap p-4 bg-muted/50 rounded-lg max-h-60 overflow-auto">{quiz}</div>
                ) : (
                  !isProcessingQuiz && <p className="text-muted-foreground text-center py-4">Your generated quiz will appear here.</p>
                )}
              </CardContent>
            </Card>
            {/* Chat Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="h-5 w-5" /> Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chatAnswer && (
                  <div className="p-4 bg-muted/50 rounded-lg text-sm mb-4">
                    <p className="font-semibold">Answer:</p>
                    <p>{chatAnswer}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask a question..."
                    value={chatQuery}
                    onChange={(e) => setChatQuery(e.target.value)}
                    disabled={!documentContent || isChatting}
                    onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                  />
                  <Button disabled={!documentContent || !chatQuery || isChatting} onClick={handleChat}>
                    {isChatting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
