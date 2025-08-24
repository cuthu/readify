
'use server';

/**
 * @fileOverview Manages documents through a service layer, allowing for fetching, adding, and deleting.
 * This will eventually connect to a real database like Upstash KV.
 */

import { ai } from '@/ai/genkit';
import { Document, DocumentSchema } from '@/types/document';
import { z } from 'genkit';
import {
  getDocuments as getDocumentsFromService,
  addDocument as addDocumentToService,
  deleteDocument as deleteDocumentFromService,
  Document as DocumentType,
} from '@/services/document-service';



// Exported functions for client-side use
export async function getDocuments(): Promise<Document[]> {
  return getDocumentsFlow();
}

export async function addDocument(doc: Omit<Document, 'id'>): Promise<Document> {
  return addDocumentFlow(doc);
}

export async function deleteDocument(id: string): Promise<{ success: boolean }> {
  return deleteDocumentFlow(id);
}


// Genkit Flows
const getDocumentsFlow = ai.defineFlow(
  {
    name: 'getDocumentsFlow',
    outputSchema: z.array(DocumentSchema),
  },
  async () => {
    return getDocumentsFromService();
  }
);

const addDocumentFlow = ai.defineFlow(
  {
    name: 'addDocumentFlow',
    inputSchema: DocumentSchema.omit({ id: true }),
    outputSchema: DocumentSchema,
  },
  async (doc) => {
    return addDocumentToService(doc);
  }
);

const deleteDocumentFlow = ai.defineFlow(
  {
    name: 'deleteDocumentFlow',
    inputSchema: z.string(),
    outputSchema: z.object({ success: z.boolean() }),
  },
  async (id) => {
    deleteDocumentFromService(id);
    return { success: true };
  }
);
