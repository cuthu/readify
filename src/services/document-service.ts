
/**
 * @fileOverview A service for managing documents.
 * This is a mock implementation that uses an in-memory array.
 * It will be replaced with a real database implementation (e.g., Upstash KV).
 */

// Define the Document type
export interface Document {
  id: string;
  name: string;
  content: string;
}

// In-memory array to act as a mock database
let documents: Document[] = [
  { id: '1', name: 'Initial Document.txt', content: 'This is a sample document that was here from the start.' },
  { id: '2', name: 'Another Example.txt', content: 'This is another sample document.' },
];

let nextId = 3;

/**
 * Retrieves all documents.
 * @returns A promise that resolves to an array of documents.
 */
export async function getDocuments(): Promise<Document[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return documents;
}

/**
 * Adds a new document.
 * @param doc - The document to add, without an ID.
 * @returns A promise that resolves to the newly created document with an ID.
 */
export async function addDocument(doc: Omit<Document, 'id'>): Promise<Document> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const newDoc = { ...doc, id: String(nextId++) };
  documents.push(newDoc);
  return newDoc;
}

/**
 * Deletes a document by its ID.
 * @param id - The ID of the document to delete.
 * @returns A promise that resolves when the document is deleted.
 */
export async function deleteDocument(id:string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 300));
  documents = documents.filter(doc => doc.id !== id);
}
