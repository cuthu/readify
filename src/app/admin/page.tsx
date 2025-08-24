
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDocuments } from '@/ai/flows/document-management';
import { getUsers } from '@/ai/flows/user-management';
import { Document } from '@/types/document';
import { User } from '@/types/user';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [docs, usersData] = await Promise.all([
            getDocuments(),
            getUsers()
        ]);
        setDocuments(docs);
        setUsers(usersData);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        // Optionally, show a toast notification for the error
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);


  return (
    <div className="flex flex-col gap-4">
       <h2 className="text-xl font-bold font-headline">Dashboard</h2>
       <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-10 w-16" />
                    ) : (
                        <p className="text-4xl font-bold">{users.length}</p>
                    )}
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
