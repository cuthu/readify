import { z } from 'genkit';

export const DocumentSchema = z.object({
  id: z.string(),
  name: z.string(),
  content: z.string(),
});

export type Document = z.infer<typeof DocumentSchema>;