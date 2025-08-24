import { z } from 'genkit';

export const DocumentSchema = z.object({
  id: z.string(),
  name: z.string(),
  content: z.string().optional(),
});

export type Document = z.infer<typeof DocumentSchema>;