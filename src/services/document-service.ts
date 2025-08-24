
/**
 * @fileOverview A service for managing documents using Upstash KV.
 */

import { Redis } from "@upstash/redis";
import { randomUUID } from "crypto";
import { Document } from "@/types/document";

// Initialize the Upstash Redis client
// This will automatically use the UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
// environment variables if they are set.
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});


const DOCUMENTS_KEY = "documents";

/**
 * Retrieves all documents.
 * @returns A promise that resolves to an array of documents.
 */
export async function getDocuments(): Promise<Document[]> {
  const documentMap = await redis.get<Record<string, Document>>(DOCUMENTS_KEY);
  if (!documentMap) {
    return [];
  }
  // Sort by createdAt date in descending order
  return Object.values(documentMap).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Adds a new document.
 * @param doc - The document to add, without an ID.
 * @returns A promise that resolves to the newly created document with an ID.
 */
export async function addDocument(doc: Omit<Document, 'id' | 'createdAt'>): Promise<Document> {
  const newId = randomUUID();
  const newDoc: Document = { 
    ...doc, 
    id: newId,
    createdAt: new Date().toISOString(),
  };
  
  // Fetch the current documents map, add the new one, and set it back
  const documentMap = await redis.get<Record<string, Document>>(DOCUMENTS_KEY) || {};
  documentMap[newId] = newDoc;
  await redis.set(DOCUMENTS_KEY, documentMap);

  return newDoc;
}

/**
 * Deletes a document by its ID.
 * @param id - The ID of the document to delete.
 * @returns A promise that resolves when the document is deleted.
 */
export async function deleteDocument(id:string): Promise<void> {
  const documentMap = await redis.get<Record<string, Document>>(DOCUMENTS_KEY);
  if (documentMap && documentMap[id]) {
    delete documentMap[id];
    await redis.set(DOCUMENTS_KEY, documentMap);
  }
}

/**
 * Deletes multiple documents by their IDs.
 * @param ids - The array of document IDs to delete.
 * @returns A promise that resolves when the documents are deleted.
 */
export async function deleteDocuments(ids: string[]): Promise<void> {
    const documentMap = await redis.get<Record<string, Document>>(DOCUMENTS_KEY);
    if (documentMap) {
        let changed = false;
        ids.forEach(id => {
            if (documentMap[id]) {
                delete documentMap[id];
                changed = true;
            }
        });
        if (changed) {
            await redis.set(DOCUMENTS_KEY, documentMap);
        }
    }
}
