import { getChapterText, getVerse } from '@/lib/bible';
import { cn } from '@/lib/utils';
import type { LanguageCode, VersionId } from '@/lib/bible';
import { Suspense } from 'react';

function VerseDisplay({
  lang,
  ver,
  book,
  chap,
  v,
}: {
  lang: LanguageCode;
  ver: VersionId;
  book: string;
  chap: string;
  v?: string;
}) {
  const verseText = v
    ? getVerse(ver, book, chap, v)
    : getChapterText(ver, book, chap);

  if (!verseText) {
    return (
      <div className="text-center text-2xl text-white/80">
        <p>Verse not found.</p>
        <p className="text-lg">Please check your selection and try again.</p>
      </div>
    );
  }

  const isSingleVerse = typeof verseText === 'string';

  return (
    <div className="w-full text-center">
      <h1
        className={cn(
          'font-headline font-bold text-white drop-shadow-md',
          isSingleVerse
            ? 'text-5xl md:text-7xl lg:text-8xl'
            : 'text-2xl md:text-3xl lg:text-4xl'
        )}
      >
        {isSingleVerse
          ? verseText
          : Object.entries(verseText)
              .map(([num, text]) => `(${num}) ${text}`)
              .join(' ')}
      </h1>
      <p className="mt-8 text-2xl md:text-4xl lg:text-5xl font-semibold text-white/70 drop-shadow">
        {book} {chap}
        {v ? `:${v}` : ''}
      </p>
    </div>
  );
}

export default function PresentationPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const lang = (searchParams.lang as LanguageCode) || 'en';
  const ver = (searchParams.ver as VersionId) || 'KJV';
  const book = (searchParams.book as string) || 'John';
  const chap = (searchParams.chap as string) || '3';
  const v = searchParams.v as string | undefined;

  return (
    <main className="flex h-dvh w-full items-center justify-center bg-primary p-8">
      <Suspense fallback={<div className="text-white text-4xl">Loading...</div>}>
        <VerseDisplay lang={lang} ver={ver} book={book} chap={chap} v={v} />
      </Suspense>
    </main>
  );
}
