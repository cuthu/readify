'use server';

import pdf from 'pdf-parse';

export async function extractTextFromPdf(fileDataUri: string) {
    if (!fileDataUri.startsWith('data:application/pdf;base64,')) {
        throw new Error('Invalid PDF data URI');
    }
    const base64Data = fileDataUri.substring('data:application/pdf;base64,'.length);
    const buffer = Buffer.from(base64Data, 'base64');
    
    const data = await pdf(buffer);
    return data.text;
}
