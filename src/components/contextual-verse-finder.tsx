'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wand2, Loader2, BookText } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { findContextualVerse } from '@/app/actions';

const FormSchema = z.object({
  prompt: z
    .string()
    .min(3, { message: 'Please enter at least 3 characters.' })
    .max(200, { message: 'Please keep your query under 200 characters.' }),
});

type FormValues = z.infer<typeof FormSchema>;
type AIResult = {
  verses: {
    book: string;
    chapter: number;
    verse: number;
    text: string;
  }[];
  spiritualInsight: string;
};

export function ContextualVerseFinder() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      prompt: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const aiResult = await findContextualVerse({
        keywordsOrPhrase: data.prompt,
      });
      setResult(aiResult as AIResult);
    } catch (e) {
      setError('An error occurred. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setResult(null);
      setError(null);
      setIsLoading(false);
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <Button onClick={() => setIsOpen(true)} variant="ghost">
        <Wand2 className="mr-2 h-4 w-4" />
        Verse Finder
      </Button>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Contextual Verse Finder</DialogTitle>
          <DialogDescription>
            Describe a topic, feeling, or situation, and let AI find relevant
            verses for you.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How are you feeling?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., 'feeling anxious about the future' or 'finding strength in hard times'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Find Verses
              </Button>
            </DialogFooter>
          </form>
        </Form>
        {result && (
          <ScrollArea className="mt-4 max-h-[40vh] rounded-md border p-4">
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 text-lg font-semibold font-headline">
                  Spiritual Insight
                </h3>
                <p className="text-muted-foreground">
                  {result.spiritualInsight}
                </p>
              </div>
              <div>
                <h3 className="mb-4 text-lg font-semibold font-headline">
                  Suggested Verses
                </h3>
                <div className="space-y-4">
                  {result.verses.map((v, i) => (
                    <div key={i} className="rounded-md border p-4">
                      <p className="font-bold text-primary">
                        {v.book} {v.chapter}:{v.verse}
                      </p>
                      <p className="mt-1 font-headline">{v.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        )}
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}
