
'use client';

import { useState, useEffect, useMemo } from 'react';
import { MoreHorizontal, FileText, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { getDocuments, deleteDocument, deleteDocuments } from '@/ai/flows/document-management';
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
    const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
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

    const filteredDocuments = useMemo(() => {
        return documents.filter(doc =>
            doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [documents, searchTerm]);

    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        if (checked === true) {
            setSelectedDocs(filteredDocuments.map(doc => doc.id));
        } else {
            setSelectedDocs([]);
        }
    };

    const handleSelectRow = (docId: string, checked: boolean) => {
        setSelectedDocs(prev =>
            checked ? [...prev, docId] : prev.filter(id => id !== docId)
        );
    };

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

    const handleBulkDeleteClick = () => {
        if (!isAdmin() || selectedDocs.length === 0) {
             toast({
                title: 'Permission Denied',
                description: 'Only an Admin can perform this action.',
                variant: 'destructive',
            });
            return;
        }
        setDocToDelete(null); // It's a bulk operation
        setIsDeleteAlertOpen(true);
    };


    const handleConfirmDelete = async () => {
        const isBulkDelete = selectedDocs.length > 0 && !docToDelete;
        const itemsToDelete = isBulkDelete ? selectedDocs : [docToDelete?.id];
        const count = itemsToDelete.length;

        if (count === 0 || !itemsToDelete[0]) return;

        try {
            if (isBulkDelete) {
                await deleteDocuments(itemsToDelete as string[]);
            } else {
                await deleteDocument(itemsToDelete[0] as string);
            }

            toast({
                title: 'Success',
                description: `${count} document${count > 1 ? 's' : ''} deleted successfully.`,
            });
            loadDocuments(); // Refresh the list
            setSelectedDocs([]);
        } catch (error: any) {
            console.error('Failed to delete document(s):', error);
            toast({
                title: 'Error',
                description: error.message || `Could not delete the document${count > 1 ? 's' : ''}.`,
                variant: 'destructive',
            });
        } finally {
            setDocToDelete(null);
            setIsDeleteAlertOpen(false);
        }
    };

    const getDeleteDialogInfo = () => {
        if (docToDelete) {
            return {
                title: 'Are you sure you want to delete this document?',
                description: `This action cannot be undone. This will permanently delete "${docToDelete.name}".`
            }
        }
        return {
            title: `Are you sure you want to delete ${selectedDocs.length} documents?`,
            description: `This action cannot be undone. This will permanently delete the selected documents.`
        }
    }


    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Document Management</CardTitle>
                    <CardDescription>View, search, and manage all documents uploaded to the application.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center mb-4 gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search by filename or owner email..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {selectedDocs.length > 0 && (
                            <Button variant="destructive" onClick={handleBulkDeleteClick}>
                                Delete Selected ({selectedDocs.length})
                            </Button>
                        )}
                    </div>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                        <Checkbox
                                            checked={selectedDocs.length > 0 && selectedDocs.length === filteredDocuments.length}
                                            onCheckedChange={handleSelectAll}
                                            aria-label="Select all"
                                        />
                                    </TableHead>
                                    <TableHead>File Name</TableHead>
                                    <TableHead>Owner</TableHead>
                                    <TableHead>Uploaded Date</TableHead>
                                    <TableHead className="w-[100px] text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                                            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredDocuments.length > 0 ? (
                                    filteredDocuments.map((doc) => (
                                        <TableRow key={doc.id} data-state={selectedDocs.includes(doc.id) ? 'selected' : ''}>
                                             <TableCell>
                                                <Checkbox
                                                    checked={selectedDocs.includes(doc.id)}
                                                    onCheckedChange={checked => handleSelectRow(doc.id, !!checked)}
                                                    aria-label={`Select document ${doc.name}`}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{doc.name}</TableCell>
                                            <TableCell>{doc.userEmail}</TableCell>
                                            <TableCell>{format(new Date(doc.createdAt), 'PPP')}</TableCell>
                                            <TableCell className="text-center">
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
                                        <TableCell colSpan={5} className="h-24 text-center">No documents found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
            <DeleteConfirmationDialog
                isOpen={isDeleteAlertOpen}
                onOpenChange={setIsDeleteAlertOpen}
                onConfirm={handleConfirmDelete}
                {...getDeleteDialogInfo()}
            />
        </>
    );
}
