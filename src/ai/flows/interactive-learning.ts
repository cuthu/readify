
'use server';
/**
 * @fileOverview Implements interactive learning features using Genkit for quiz generation and question answering.
 *
 * - interactiveLearning - A function that handles the interactive learning process.
 * - InteractiveLearningInput - The input type for the interactiveLearning function.
 * - InteractiveLearningOutput - The return type for the interactiveLearning function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InteractiveLearningInputSchema = z.object({
  documentContent: z
    .string()
    .describe('The content of the document to generate quizzes from and ask questions about.'),
  query: z.string().optional().describe('An optional question about the document content.'),
  quizFormatInstructions: z
    .string()
    .optional()
    .default('a multiple-choice quiz with 4 options per question')
    .describe(
      'Optional instructions on the format of the quiz. Example: Multiple choice, true/false, etc.'
    ),
});
export type InteractiveLearningInput = z.infer<typeof InteractiveLearningInputSchema>;

const InteractiveLearningOutputSchema = z.object({
  quiz: z
    .string()
    .describe(
      'A quiz generated from the document content, formatted as a string. Include questions and answers.'
    ),
  answer: z
    .string()
    .optional()
    .describe('An answer to the question about the document content.'),
});
export type InteractiveLearningOutput = z.infer<typeof InteractiveLearningOutputSchema>;

export async function interactiveLearning(
  input: InteractiveLearningInput
): Promise<InteractiveLearningOutput> {
  return interactiveLearningFlow(input);
}

const interactiveLearningPrompt = ai.definePrompt({
  name: 'interactiveLearningPrompt',
  input: {schema: InteractiveLearningInputSchema},
  output: {schema: InteractiveLearningOutputSchema},
  prompt: `You are an expert AI Learning Assistant. Your task is to help users understand a document by generating quizzes and answering their questions.

Analyze the following document:
---
{{{documentContent}}}
---

Based on the document and the user's request, perform the following actions:

1.  **Quiz Generation**:
    *   ALWAYS generate a quiz based on the document.
    *   The quiz should be formatted as {{{quizFormatInstructions}}}.
    *   Ensure the quiz is comprehensive and covers key aspects of the document.
    *   Clearly label the questions and options. Provide an answer key at the end of the quiz.

2.  **Question Answering**:
    *   Check if the user has provided a question (query).
    *   If a question is present: "{{{query}}}", provide a clear and concise answer based *only* on the content of the provided document.
    *   If there is no question, leave the 'answer' field empty.

Please provide your response in the specified JSON format.
`,
});

const interactiveLearningFlow = ai.defineFlow(
  {
    name: 'interactiveLearningFlow',
    inputSchema: InteractiveLearningInputSchema,
    outputSchema: InteractiveLearningOutputSchema,
  },
  async input => {
    const {output} = await interactiveLearningPrompt(input);
    return output!;
  }
);
