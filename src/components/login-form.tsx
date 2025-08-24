
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login as loginFlow } from '@/ai/flows/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export function LoginForm() {
    const router = useRouter();
    const { login } = useAuth();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setIsLoading(true);
        try {
            const result = await loginFlow({ email, password });
            if (result.success && result.user) {
                login(result.user); // Save user to context
                toast({
                    title: 'Login Successful',
                    description: 'Welcome back!',
                });
                router.push('/app');
            } else {
                toast({
                    title: 'Login Failed',
                    description: result.message,
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                title: 'An Error Occurred',
                description: 'Something went wrong. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="shadow-xl">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-headline">
                    Welcome Back
                </CardTitle>
                <CardDescription>
                    Enter your credentials to access your account.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                        id="email" 
                        type="email" 
                        placeholder="you@example.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                        id="password" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleLogin()}
                        disabled={isLoading}
                    />
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <Button className="w-full" onClick={handleLogin} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Log In
                </Button>
            </CardFooter>
        </Card>
    );
}
