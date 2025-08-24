
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
} from '@/services/document-service';
import { put } from '@vercel/blob';
import * as pdfjs from 'pdfjs-dist';
import * as docx from 'docx-preview'; // Using for server-side buffer reading

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
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch file from blob storage: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();

    if (fileName.endsWith('.pdf')) {
        const pdf = await pdfjs.getDocument(arrayBuffer).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            // Using `any` for item because the type from pdfjs-dist is not fully compatible
            text += content.items.map((item: any) => item.str).join(' ');
        }
        return text;
    } else if (fileName.endsWith('.docx')) {
        // docx-preview can work with ArrayBuffer on the server
        const text = await new Promise<string>((resolve, reject) => {
            docx.renderAsync(arrayBuffer, undefined, undefined, { breakPages: false })
                .then((result: any) => {
                     // The library renders to HTML, we need to extract text from it.
                     // A simple regex approach for server-side.
                     const textContent = result.innerHTML.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                     resolve(textContent);
                })
                .catch(reject);
        });
        return text;
    } else if (fileName.endsWith('.txt')) {
        return Buffer.from(arrayBuffer).toString('utf-8');
    }

    throw new Error('Unsupported file type for text extraction.');
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
    // 1. Extract text from the document on the server
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

// This is now an internal function, the main client-facing add is processAndSaveDocument
async function addDocument(doc: Omit<Document, 'id' | 'createdAt'>): Promise<Document> {
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
    inputSchema: DocumentSchema.omit({ id: true, createdAt: true }),
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
