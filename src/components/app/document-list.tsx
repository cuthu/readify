
'use client';

import { useState, useEffect } from 'react';
import {
  SidebarGroup,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import {
  Folder,
  Trash2,
  FileText,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { getDocuments, deleteDocument } from '@/ai/flows/document-management';
import { Document } from '@/types/document';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface DocumentListProps {
  onDocumentSelect: (doc: Document) => void;
  onDocumentDeleted: (deletedDocId: string) => void;
}

export function DocumentList({ onDocumentSelect, onDocumentDeleted }: DocumentListProps) {
  const { user } = useAuth();
  const [myDocsOpen, setMyDocsOpen] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDocuments = async () => {
    if (!user) return;
    setIsLoadingDocs(true);
    try {
      const docs = await getDocuments();
      const userDocs = docs.filter(doc => doc.userId === user.id);
      setDocuments(userDocs);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not fetch your documents.',
        variant: 'destructive',
      });
      console.error(error);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    const handleDocAdded = () => fetchDocuments();
    window.addEventListener('document-added', handleDocAdded);
    return () => {
        window.removeEventListener('document-added', handleDocAdded);
    }
  }, [user]);

  const handleDeleteDocument = async (e: React.MouseEvent, docId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleting(docId);
    try {
      await deleteDocument(docId);
      toast({
        title: 'Success',
        description: 'Document deleted.',
      });
      fetchDocuments(); // Refresh the list
      onDocumentDeleted(docId); // Notify parent component
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not delete the document.',
        variant: 'destructive',
      });
      console.error(error);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <SidebarGroup>
      <SidebarMenuItem>
        <SidebarMenuButton onClick={() => setMyDocsOpen(!myDocsOpen)} isActive={myDocsOpen}>
          <Folder />
          My Documents
          <ChevronDown
            className={`ml-auto h-4 w-4 transform transition-transform ${
              myDocsOpen ? 'rotate-180' : ''
            }`}
          />
        </SidebarMenuButton>
        {myDocsOpen && (
          <SidebarMenuSub>
            {isLoadingDocs ? (
              <div className="flex justify-center items-center p-2"><Loader2 className="h-4 w-4 animate-spin" /></div>
            ) : documents.length > 0 ? (
              documents.map(doc => (
                <SidebarMenuSubItem key={doc.id}>
                  <SidebarMenuSubButton onClick={() => onDocumentSelect(doc)}>
                      <FileText className="mr-2 h-4 w-4" />
                      <span className="truncate">{doc.name}</span>
                      {isDeleting === doc.id ? (
                        <Loader2 className="ml-auto h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2
                          className="ml-auto h-4 w-4 text-muted-foreground transition-colors hover:text-destructive"
                          onClick={(e) => handleDeleteDocument(e, doc.id)}
                        />
                      )}
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))
            ) : (
              <p className="px-4 py-2 text-xs text-muted-foreground">No documents found.</p>
            )}
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    </SidebarGroup>
  );
}
