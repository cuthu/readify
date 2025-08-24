import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="py-20 md:py-32">
      <div className="container text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
          Transform Documents into Knowledge
        </h1>
        <p className="mx-auto mt-6 max-w-[700px] text-lg text-foreground/80 md:text-xl">
          Listen to your documents, instantly summarize key insights, and chat
          with your content, all in one intuitive platform.
        </p>
        <div className="mt-8 flex justify-center">
          <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/login">Access Your Account</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
