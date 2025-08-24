import Link from 'next/link';
import { BookOpenText } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-secondary/50">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <BookOpenText className="h-6 w-6 text-primary" />
            <span className="font-headline text-lg">Readify</span>
          </Link>
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built for the future of reading. &copy; {new Date().getFullYear()}
          </p>
        </div>
        <div className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Terms of Service
            </Link>
        </div>
      </div>
    </footer>
  );
}
