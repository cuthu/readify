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
    .describe(
      'Optional instructions on the format of the quiz. Example: Multiple choice, true/false, etc.'
    ),
});
export type InteractiveLearningInput = z.infer<typeof InteractiveLearningInputSchema>;

const InteractiveLearningOutputSchema = z.object({
  quiz: z.string().describe('A quiz generated from the document content.'),
  answer: z.string().optional().describe('An answer to the question about the document content.'),
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
  prompt: `You are an interactive learning assistant.  You will generate a quiz from the document content, and answer a question about the document content if one is provided.\n\nDocument Content: {{{documentContent}}}\n\nQuiz Format Instructions: {{{quizFormatInstructions}}}\n\nQuestion: {{{query}}}\n\nInstructions: First, generate a quiz from the document content.  The quiz should follow the format instructions if provided.  Second, if a question is provided, answer the question about the document content.\n\nOutput the quiz and the answer in the following JSON format:\n{
  "quiz": "...",
  "answer": "..."
}
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
