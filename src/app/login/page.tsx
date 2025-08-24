import { LoginForm } from '@/components/login-form';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="absolute -top-20 left-0 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          legacyBehavior>
            <ArrowLeft className="h-4 w-4" />
            Back to home
        </Link>
        <LoginForm />
      </div>
    </div>
  );
}
