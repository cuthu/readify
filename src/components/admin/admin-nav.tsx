
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function AdminNav() {
  const pathname = usePathname();

  // Determine the current tab based on the URL path
  const getCurrentTab = () => {
    if (pathname.startsWith('/admin/users')) {
      return 'users';
    }
    if (pathname.startsWith('/admin/documents')) {
      return 'documents';
    }
    return 'dashboard';
  };

  const currentTab = getCurrentTab();
  
  return (
    <Tabs value={currentTab} className="w-full">
      <TabsList>
        <Link href="/admin" passHref>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </Link>
        <Link href="/admin/users" passHref>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </Link>
        <TabsTrigger value="documents" disabled>Document Management</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
