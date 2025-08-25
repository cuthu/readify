
'use server';

/**
 * @fileOverview Manages documents through a service layer, allowing for fetching, adding, deleting, and processing.
 * This connects to a real database (Upstash KV) and blob storage (Vercel Blob).
 */

import { ai } from '@/ai/genkit';
import { Document, DocumentSchema } from '@/types/document';
import { z } from 'genkit';
import {
  getDocuments as getDocumentsFromService,
  addDocument as addDocumentToService,
  deleteDocument as deleteDocumentFromService,
  deleteDocuments as deleteDocumentsFromService,
  updateDocument as updateDocumentInService,
} from '@/services/document-service';
import { put } from '@vercel/blob';

// Server Action for file upload to Vercel Blob
export async function uploadDocument(formData: FormData): Promise<{ url?: string; error?: string }> {
    const file = formData.get('file') as File;
    if (!file) {
        return { error: 'No file provided' };
    }

    try {
        // Check if a file with the same name and content hash already exists
        const blob = await put(file.name, file, {
            access: 'public',
            addRandomSuffix: false, // Use a predictable name
        });
        return { url: blob.url };
    } catch (error: any) {
        return { error: error.message };
    }
}

// Helper to extract text from different file types on the server
const extractTextFromServer = async (url: string, fileName: string): Promise<string> => {
    if (fileName.endsWith('.pdf') || fileName.endsWith('.docx')) {
        // Client-side handles PDF and DOCX text extraction
        return '';
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch file from blob storage: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    
    if (fileName.endsWith('.txt')) {
        return Buffer.from(arrayBuffer).toString('utf-8');
    }

    throw new Error('Unsupported file type for server-side text extraction.');
};


// Main processing flow
const ProcessDocumentInputSchema = z.object({
  fileName: z.string(),
  url: z.string(),
  userId: z.string(),
  userEmail: z.string().email(),
});

export async function processAndSaveDocument(input: z.infer<typeof ProcessDocumentInputSchema>): Promise<Document> {
  return processDocumentFlow(input);
}

const processDocumentFlow = ai.defineFlow(
  {
    name: 'processDocumentFlow',
    inputSchema: ProcessDocumentInputSchema,
    outputSchema: DocumentSchema,
  },
  async ({ fileName, url, userId, userEmail }) => {
    // 1. Extract text from the document on the server (if supported)
    const content = await extractTextFromServer(url, fileName);

    // 2. Save the document metadata (including content) to the database
    const newDoc = await addDocumentToService({
        name: fileName,
        content: content,
        url: url,
        userId,
        userEmail,
    });
    
    return newDoc;
  }
);


// Exported functions for client-side use
export async function getDocuments(): Promise<Document[]> {
  return getDocumentsFlow();
}

export async function deleteDocument(id: string): Promise<{ success: boolean }> {
  return deleteDocumentFlow(id);
}

export async function deleteDocuments(ids: string[]): Promise<{ success: boolean }> {
    return deleteDocumentsFlow(ids);
}

const AddAudioToDocumentInputSchema = z.object({
    documentId: z.string(),
    audioDataUri: z.string(),
});
export async function addAudioToDocument(input: z.infer<typeof AddAudioToDocumentInputSchema>): Promise<{ success: boolean }> {
    return addAudioToDocumentFlow(input);
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

const deleteDocumentFlow = ai.defineFlow(
  {
    name: 'deleteDocumentFlow',
    inputSchema: z.string(),
    outputSchema: z.object({ success: z.boolean() }),
  },
  async (id) => {
    await deleteDocumentFromService(id);
    return { success: true };
  }
);

const deleteDocumentsFlow = ai.defineFlow(
    {
      name: 'deleteDocumentsFlow',
      inputSchema: z.array(z.string()),
      outputSchema: z.object({ success: z.boolean() }),
    },
    async (ids) => {
      await deleteDocumentsFromService(ids);
      return { success: true };
    }
);

const addAudioToDocumentFlow = ai.defineFlow(
    {
        name: 'addAudioToDocumentFlow',
        inputSchema: AddAudioToDocumentInputSchema,
        outputSchema: z.object({ success: z.boolean() }),
    },
    async ({ documentId, audioDataUri }) => {
        await updateDocumentInService(documentId, { audioDataUri });
        return { success: true };
    }
);

    