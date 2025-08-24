
'use client';

import { useState, useEffect, useMemo } from 'react';
import { MoreHorizontal, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getUsers, deleteUser } from '@/ai/flows/user-management';
import { User } from '@/types/user';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { AddUserDialog } from '@/components/admin/users/add-user-dialog';
import { EditUserDialog } from '@/components/admin/users/edit-user-dialog';
import { DeleteConfirmationDialog } from '@/components/admin/delete-confirmation-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';

export default function UserManagementPage() {
    const { user: currentUser, isAdmin } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
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

    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);


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
        if (currentUser?.id === user.id) {
             toast({
                title: 'Action Not Allowed',
                description: 'You cannot delete your own account.',
                variant: 'destructive',
            });
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
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Signed Up</TableHead>
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
                                ) : filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
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
