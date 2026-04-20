import { BibleReader } from '@/components/bible-reader';
import { Suspense } from 'react';

export default function Home() {
  return (
    <main className="flex h-dvh flex-col bg-background text-foreground">
      <Suspense fallback={<div>Loading...</div>}>
        <BibleReader />
      </Suspense>
    </main>
  );
}
