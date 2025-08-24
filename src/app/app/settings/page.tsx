
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { User, Lock, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const { user } = useAuth();

  if (!user) {
    // Or a loading spinner
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="mr-2 h-4 w-4" />
            Appearance
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardDescription>Update your name and profile picture.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center text-muted-foreground py-12">
              <p>(Profile editing feature coming soon)</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>For your security, we recommend using a strong password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center text-muted-foreground py-12">
               <p>(Password change feature coming soon)</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
            <Card>
                <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>Customize the look and feel of the application.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-center text-muted-foreground py-12">
                    <p>(Theme toggle feature coming soon)</p>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>

        <Card className="mt-8 border-destructive">
            <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>These actions are permanent and cannot be undone.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div>
                    <p className="font-semibold">Export Your Data</p>
                    <p className="text-sm text-muted-foreground">Download all your documents and account information.</p>
                </div>
                <Button variant="outline" disabled>(Coming Soon)</Button>
            </CardContent>
             <CardContent className="flex flex-col sm:flex-row gap-4 justify-between items-center border-t border-destructive/20 pt-6">
                <div>
                    <p className="font-semibold text-destructive">Delete Your Account</p>
                    <p className="text-sm text-muted-foreground">This will permanently delete your account and all associated data.</p>
                </div>
                <Button variant="destructive" disabled>(Coming Soon)</Button>
            </CardContent>
        </Card>

    </div>
  );
}
