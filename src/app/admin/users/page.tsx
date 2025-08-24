
'use client';

import { useState, useEffect, useMemo } from 'react';
import { MoreHorizontal, Search, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getUsers, deleteUser } from '@/ai/flows/user-management';
import { User } from '@/types/user';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { AddUserDialog } from '@/components/admin/users/add-user-dialog';
import { DeleteConfirmationDialog } from '@/components/admin/delete-confirmation-dialog';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { EditUserDialog } from '@/components/admin/users/edit-user-dialog';

type SortKey = keyof User | 'createdAt';
type SortDirection = 'asc' | 'desc';

export default function UserManagementPage() {
    const { user: currentUser, isAdmin } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('createdAt');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const { toast } = useToast();

    const handleActionWithoutPermission = () => {
        toast({
            title: 'Permission Denied',
            description: 'Only an Admin can perform this action.',
            variant: 'destructive',
        });
    }

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const fetchedUsers = await getUsers();
            setUsers(fetchedUsers);
        } catch (error) {
            console.error("Failed to fetch users", error);
            toast({ title: "Error", description: "Failed to fetch users.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadUsers();
    }, []);

    const sortedAndFilteredUsers = useMemo(() => {
        return users
            .filter(user =>
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => {
                const aValue = a[sortKey];
                const bValue = b[sortKey];
                
                if (aValue < bValue) {
                    return sortDirection === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortDirection === 'asc' ? 1 : -1;
                }
                return 0;
            });
    }, [users, searchTerm, sortKey, sortDirection]);
    
    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const renderSortIcon = (key: SortKey) => {
        if (sortKey !== key) {
            return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />;
        }
        return sortDirection === 'asc' ? 
            <ArrowUpDown className="ml-2 h-4 w-4" /> : 
            <ArrowUpDown className="ml-2 h-4 w-4" />;
    }

    const handleEditClick = (user: User) => {
        if (!isAdmin()) {
            handleActionWithoutPermission();
            return;
        }
        setUserToEdit(user);
        setIsEditUserDialogOpen(true);
    };

    const handleDeleteClick = (user: User) => {
        if (!isAdmin()) {
            handleActionWithoutPermission();
            return;
        }
        // Admins can't delete themselves
        if (currentUser?.id === user.id) {
            toast({ title: "Action Not Allowed", description: "You cannot delete your own account.", variant: "destructive" });
            return;
        }
        setUserToDelete(user);
        setIsDeleteAlertOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;

        try {
            await deleteUser(userToDelete.id);
            toast({
                title: 'User Deleted',
                description: `The user ${userToDelete.email} has been deleted.`,
            });
            loadUsers(); // Refresh the list
        } catch (error: any) {
            console.error('Failed to delete user:', error);
            toast({
                title: 'Error',
                description: error.message || 'Could not delete the user.',
                variant: 'destructive',
            });
        } finally {
            setUserToDelete(null);
            setIsDeleteAlertOpen(false);
        }
    };


    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>User Management</CardTitle>
                            <CardDescription>View, add, and manage user accounts.</CardDescription>
                        </div>
                        <AddUserDialog onUserAdded={loadUsers} />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search by email..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                     <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        <Button variant="ghost" onClick={() => handleSort('email')} className="px-0">
                                            Email {renderSortIcon('email')}
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button variant="ghost" onClick={() => handleSort('role')} className="px-0">
                                            Role {renderSortIcon('role')}
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button variant="ghost" onClick={() => handleSort('createdAt')} className="px-0">
                                            Signed Up {renderSortIcon('createdAt')}
                                        </Button>
                                    </TableHead>
                                    <TableHead className="w-[100px] text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                                            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : sortedAndFilteredUsers.length > 0 ? (
                                    sortedAndFilteredUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{user.role}</TableCell>
                                            <TableCell>{format(new Date(user.createdAt), 'PPP')}</TableCell>
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
                                                        <DropdownMenuItem
                                                            disabled={!isAdmin() || currentUser?.id === user.id}
                                                            onClick={() => handleEditClick(user)}
                                                        >
                                                            Edit Role
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            disabled={!isAdmin() || currentUser?.id === user.id}
                                                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                                            onClick={() => handleDeleteClick(user)}
                                                        >
                                                            Delete User
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center">No users found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {userToEdit && (
                <EditUserDialog
                    isOpen={isEditUserDialogOpen}
                    onOpenChange={setIsEditUserDialogOpen}
                    user={userToEdit}
                    onUserUpdated={() => {
                        setIsEditUserDialogOpen(false);
                        loadUsers();
                    }}
                />
            )}

            <DeleteConfirmationDialog
                isOpen={isDeleteAlertOpen}
                onOpenChange={setIsDeleteAlertOpen}
                onConfirm={handleConfirmDelete}
                title="Are you sure you want to delete this user?"
                description={`This action cannot be undone. This will permanently delete the account for ${userToDelete?.email}.`}
            />
        </>
    );
}
