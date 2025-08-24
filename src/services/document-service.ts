
/**
 * @fileOverview A service for managing documents using Upstash KV.
 */

import { Redis } from "@upstash/redis";
import { randomUUID } from "crypto";

// Define the Document type
export interface Document {
  id: string;
  name: string;
  content: string;
}

// Initialize the Upstash Redis client
// This will automatically use the UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
// environment variables.
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
  return Object.values(documentMap);
}

/**
 * Adds a new document.
 * @param doc - The document to add, without an ID.
 * @returns A promise that resolves to the newly created document with an ID.
 */
export async function addDocument(doc: Omit<Document, 'id'>): Promise<Document> {
  const newId = randomUUID();
  const newDoc: Document = { ...doc, id: newId };
  
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
