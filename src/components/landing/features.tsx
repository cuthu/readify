import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Ear, Sparkles, Bot } from 'lucide-react';

const featuresList = [
  {
    icon: <Ear className="h-8 w-8 text-primary" />,
    title: 'Listen & Learn',
    description: 'Convert PDFs and text into natural, high-quality audio. Choose from a variety of voices to listen to your documents wherever you are.',
  },
  {
    icon: <Sparkles className="h-8 w-8 text-primary" />,
    title: 'Instant Insights',
    description: 'Use our AI tools to automatically summarize documents, pull out key points, and create glossaries with a single click.',
  },
  {
    icon: <Bot className="h-8 w-8 text-primary" />,
    title: 'Interactive Learning',
    description: 'Generate quizzes from your content and chat with your documents to ask questions and get instant, accurate answers.',
  },
];

export function Features() {
  return (
    <section id="features" className="py-12 md:py-16 bg-secondary/50">
      <div className="container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">Key Features</h2>
          <p className="mt-4 text-lg text-foreground/80">
            Everything you need to turn static documents into dynamic learning experiences.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {featuresList.map((feature) => (
            <Card key={feature.title} className="flex flex-col items-center text-center p-6 transition-transform transform hover:-translate-y-2 shadow-lg">
              <CardHeader className='p-2'>
                {feature.icon}
              </CardHeader>
              <CardTitle className="mt-4 mb-2 font-headline">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
