import { Mail, Lock, UploadCloud } from 'lucide-react';

const steps = [
    {
        icon: <Mail className="h-10 w-10 text-primary" />,
        title: "1. Get Your Invitation",
        description: "Readify is currently invite-only. Once you receive your invitation, you're ready to get started."
    },
    {
        icon: <Lock className="h-10 w-10 text-primary" />,
        title: "2. Log In Securely",
        description: "Use your pre-registered credentials to log into our secure platform."
    },
    {
        icon: <UploadCloud className="h-10 w-10 text-primary" />,
        title: "3. Upload & Explore",
        description: "It's easy to upload your first document and start using our powerful AI tools."
    }
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-12 md:py-16">
      <div className="container">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">How It Works</h2>
          <p className="mt-4 text-lg text-foreground/80">
            A simple guide for invited users to get started in three easy steps.
          </p>
        </div>
        <div className="relative">
            <div className="absolute left-1/2 top-5 hidden h-full w-px -translate-x-1/2 bg-border md:block" aria-hidden="true"></div>
            <div className="grid gap-12 md:grid-cols-3">
            {steps.map((step, index) => (
                <div key={step.title} className="flex flex-col items-center text-center">
                    <div className="mb-4 rounded-full bg-primary/10 p-4 ring-8 ring-background">{step.icon}</div>
                    <h3 className="text-xl font-bold font-headline">{step.title}</h3>
                    <p className="mt-2 text-foreground/80">{step.description}</p>
                </div>
            ))}
            </div>
        </div>
      </div>
    </section>
  );
}
