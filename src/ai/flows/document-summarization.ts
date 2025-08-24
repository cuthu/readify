
'use server';

/**
 * @fileOverview A document summarization AI agent.
 *
 * - summarizeDocument - A function that handles the document summarization process.
 * - SummarizeDocumentInput - The input type for the summarizeDocument function.
 * - SummarizeDocumentOutput - The return type for the summarizeDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDocumentInputSchema = z.object({
  documentText: z.string().describe('The text content of the document to summarize.'),
});
export type SummarizeDocumentInput = z.infer<typeof SummarizeDocumentInputSchema>;

const SummarizeDocumentOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the document, written in a single paragraph.'),
  keyPoints: z.array(z.string()).describe('A list of the most important key points or takeaways from the document.'),
  glossary: z.record(z.string(), z.string()).describe('A glossary of important or complex terms found in the document, with their definitions.'),
});
export type SummarizeDocumentOutput = z.infer<typeof SummarizeDocumentOutputSchema>;

export async function summarizeDocument(input: SummarizeDocumentInput): Promise<SummarizeDocumentOutput> {
  return summarizeDocumentFlow(input);
}

const summarizeDocumentPrompt = ai.definePrompt({
  name: 'summarizeDocumentPrompt',
  input: {schema: SummarizeDocumentInputSchema},
  output: {schema: SummarizeDocumentOutputSchema},
  prompt: `You are an expert AI assistant tasked with analyzing and distilling the provided document. Your goal is to make the content easily understandable for the user.

Analyze the following document:
---
{{{documentText}}}
---

Based on the document, please provide the following in the specified JSON format:
1.  **summary**: A concise, single-paragraph summary of the document's main ideas.
2.  **keyPoints**: A bulleted list of the most critical takeaways and insights.
3.  **glossary**: A dictionary of important or complex terms found in the document. Each entry should have the term as the key and its definition as the value.

Please ensure your output is clear, accurate, and directly derived from the document content.`,
});

const summarizeDocumentFlow = ai.defineFlow(
  {
    name: 'summarizeDocumentFlow',
    inputSchema: SummarizeDocumentInputSchema,
    outputSchema: SummarizeDocumentOutputSchema,
  },
  async input => {
    const {output} = await summarizeDocumentPrompt(input);
    return output!;
  }
);
