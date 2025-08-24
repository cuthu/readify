
'use server';

/**
 * @fileOverview A flow to process uploaded files, extracting text content.
 * Supports PDF and plain text files.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import pdf from 'pdf-parse';

const ProcessFileInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "The file content as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ProcessFileInput = z.infer<typeof ProcessFileInputSchema>;

const ProcessFileOutputSchema = z.object({
  textContent: z.string().describe('The extracted text content from the file.'),
});
export type ProcessFileOutput = z.infer<typeof ProcessFileOutputSchema>;


export async function processFile(input: ProcessFileInput): Promise<ProcessFileOutput> {
  return processFileFlow(input);
}


const processFileFlow = ai.defineFlow(
  {
    name: 'processFileFlow',
    inputSchema: ProcessFileInputSchema,
    outputSchema: ProcessFileOutputSchema,
  },
  async ({ fileDataUri }) => {
    
    const [header, base64Data] = fileDataUri.split(',');
    if (!header || !base64Data) {
        throw new Error('Invalid data URI format.');
    }

    const mimeType = header.match(/data:(.*);base64/)?.[1];
    if (!mimeType) {
        throw new Error('Could not determine MIME type from data URI.');
    }

    const buffer = Buffer.from(base64Data, 'base64');
    let textContent = '';

    if (mimeType === 'application/pdf') {
        const data = await pdf(buffer);
        textContent = data.text;
    } else if (mimeType.startsWith('text/')) {
        textContent = buffer.toString('utf-8');
    } else {
        throw new Error(`Unsupported file type: ${mimeType}`);
    }

    return { textContent };
  }
);
