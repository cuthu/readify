
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { User, Lock, Palette, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { updateUser } from '@/ai/flows/user-management';

const ProfileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
});

export default function SettingsPage() {
  const { user, updateUser: updateAuthUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof ProfileFormSchema>>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: {
      name: user?.name || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof ProfileFormSchema>) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const updatedUserData = await updateUser({ id: user.id, data: { name: values.name } });
      if (updatedUserData) {
        // Create a new user object for the auth context, ensuring we don't include the password
        const { password, createdAt, ...userForAuth } = updatedUserData;
        updateAuthUser(userForAuth);
        toast({
          title: 'Success',
          description: 'Your profile has been updated.',
        });
      } else {
        throw new Error('User data not returned from update.');
      }
    } catch (error) {
       toast({
        title: 'Error',
        description: 'Failed to update your profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!user) {
    // Or a loading spinner
    return <div className="p-8">Loading...</div>;
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Card>
                <CardHeader>
                  <CardTitle>Profile Details</CardTitle>
                  <CardDescription>Update your name. Email cannot be changed.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input value={user.email} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
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
