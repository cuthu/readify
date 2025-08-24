
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '@/lib/firebase'; // Import the initialized Firebase app

type FormMode = 'login' | 'signup';

export function LoginForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [mode, setMode] = useState<FormMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAuthAction = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const auth = getAuth(app);

        try {
            if (mode === 'signup') {
                await createUserWithEmailAndPassword(auth, email, password);
                toast({
                    title: 'Account Created',
                    description: "You've been successfully signed up! Please log in.",
                });
                setMode('login'); // Switch to login mode after successful signup
            } else {
                await signInWithEmailAndPassword(auth, email, password);
                toast({
                    title: 'Logged In Successfully',
                    description: "Welcome back!",
                });
                router.push('/app');
            }
        } catch (error: any) {
            console.error(`${mode === 'login' ? 'Login' : 'Signup'} Error:`, error);
            const friendlyMessage = error.message
                .replace('Firebase: ', '')
                .replace(/ \(auth\/[a-z-]+\)\.?/, '');

            toast({
                title: `Error during ${mode === 'login' ? 'login' : 'sign up'}`,
                description: friendlyMessage,
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
                    {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
                </CardTitle>
                <CardDescription>
                    {mode === 'login' ? 'Enter your credentials to access your account.' : 'Fill in the details to sign up.'}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading}/>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <Button className="w-full" onClick={handleAuthAction} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {mode === 'login' ? 'Log In' : 'Sign Up'}
                </Button>
                <Button variant="link" size="sm" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} disabled={isLoading}>
                    {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                </Button>
            </CardFooter>
        </Card>
    );
}
