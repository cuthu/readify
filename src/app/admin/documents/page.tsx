
'use client';

import { useState, useEffect } from 'react';
import { MoreHorizontal, FileText, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getDocuments, deleteDocument } from '@/ai/flows/document-management';
import { Document } from '@/types/document';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { DeleteConfirmationDialog } from '@/components/admin/delete-confirmation-dialog';
import Link from 'next/link';

export default function DocumentManagementPage() {
    const { isAdmin } = useAuth();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [docToDelete, setDocToDelete] = useState<Document | null>(null);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const { toast } = useToast();

    const loadDocuments = async () => {
        setIsLoading(true);
        try {
            const fetchedDocs = await getDocuments();
            setDocuments(fetchedDocs);
        } catch (error) {
            console.error("Failed to fetch documents", error);
            toast({ title: "Error", description: "Failed to fetch documents.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadDocuments();
    }, []);

    const handleDeleteClick = (doc: Document) => {
        if (!isAdmin()) {
            toast({
                title: 'Permission Denied',
                description: 'Only an Admin can perform this action.',
                variant: 'destructive',
            });
            return;
        }
        setDocToDelete(doc);
        setIsDeleteAlertOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!docToDelete) return;

        try {
            await deleteDocument(docToDelete.id);
            toast({
                title: 'Document Deleted',
                description: `The document "${docToDelete.name}" has been deleted.`,
            });
            loadDocuments(); // Refresh the list
        } catch (error: any) {
            console.error('Failed to delete document:', error);
            toast({
                title: 'Error',
                description: error.message || 'Could not delete the document.',
                variant: 'destructive',
            });
        } finally {
            setDocToDelete(null);
            setIsDeleteAlertOpen(false);
        }
    };


    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Document Management</CardTitle>
                    <CardDescription>View and manage all documents uploaded to the application.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>File Name</TableHead>
                                <TableHead>Owner</TableHead>
                                <TableHead>Uploaded Date</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                                    </TableRow>
                                ))
                            ) : documents.length > 0 ? (
                                documents.map((doc) => (
                                    <TableRow key={doc.id}>
                                        <TableCell className="font-medium">{doc.name}</TableCell>
                                        <TableCell>{doc.userEmail}</TableCell>
                                        <TableCell>{format(new Date(doc.createdAt), 'PPP')}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={doc.url} target="_blank" rel="noopener noreferrer">
                                                            View File
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        disabled={!isAdmin()}
                                                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                                        onClick={() => handleDeleteClick(doc)}
                                                    >
                                                        Delete Document
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">No documents found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <DeleteConfirmationDialog
                isOpen={isDeleteAlertOpen}
                onOpenChange={setIsDeleteAlertOpen}
                onConfirm={handleConfirmDelete}
                title="Are you sure you want to delete this document?"
                description={`This action cannot be undone. This will permanently delete "${docToDelete?.name}".`}
            />
        </>
    );
}
