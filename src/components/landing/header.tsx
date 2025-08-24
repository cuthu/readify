import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpenText } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <BookOpenText className="h-6 w-6 text-primary" />
          <span className="font-headline text-xl">Readify</span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
             <Button asChild>
                <Link href="/login">Log In</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
