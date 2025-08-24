import { z } from 'genkit';

export const DocumentSchema = z.object({
  id: z.string(),
  name: z.string(),
  content: z.string(),
  url: z.string().describe('The URL of the document in Vercel Blob storage.'),
  userId: z.string().describe('The ID of the user who uploaded the document.'),
  userEmail: z.string().email().describe('The email of the user who uploaded the document.'),
  createdAt: z.string().datetime(),
});

export type Document = z.infer<typeof DocumentSchema>;
