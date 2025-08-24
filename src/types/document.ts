import { z } from 'genkit';

export const DocumentSchema = z.object({
  id: z.string(),
  name: z.string(),
  content: z.string(),
  url: z.string().describe('The URL of the document in Vercel Blob storage.'),
});

export type Document = z.infer<typeof DocumentSchema>;
