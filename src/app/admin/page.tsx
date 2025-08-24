
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDocuments } from '@/ai/flows/document-management';
import { Document } from '@/types/document';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDocuments() {
      try {
        const docs = await getDocuments();
        setDocuments(docs);
      } catch (error) {
        console.error("Failed to fetch documents", error);
        // Optionally, show a toast notification for the error
      } finally {
        setIsLoading(false);
      }
    }
    loadDocuments();
  }, []);


  return (
    <div className="flex flex-col gap-4">
       <h1 className="text-2xl font-bold font-headline">Admin Dashboard</h1>
       <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold">0</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Total Documents</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-10 w-16" />
                    ) : (
                        <p className="text-4xl font-bold">{documents.length}</p>
                    )}
                </CardContent>
            </Card>
       </div>
    </div>
  );
}
