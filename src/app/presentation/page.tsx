import { getChapterText, getVerse } from '@/lib/bible';
import { cn } from '@/lib/utils';
import type { LanguageCode, Version } from '@/lib/bible';
import { Suspense } from 'react';

async function VerseDisplay({
  lang,
  ver,
  book, // book name
  chap, // chapter number
  v, // verse number
}: {
  lang: LanguageCode;
  ver: Version;
  book: string;
  chap: string;
  v?: string;
}) {
  const isSingleVerse = !!v;
  let verseText, bookName, chapterNumber, verseNumber;

  if (isSingleVerse) {
    const verseContent = getVerse(ver, book, chap, v);
    if (verseContent) {
      verseText = verseContent;
      bookName = book;
      chapterNumber = chap;
      verseNumber = v;
    }
  } else {
    const chapterContent = getChapterText(ver, book, chap);
    if (chapterContent) {
      verseText = chapterContent;
      bookName = book;
      chapterNumber = chap;
    }
  }

  if (!verseText || (typeof verseText !== 'string' && Object.keys(verseText).length === 0)) {
    return (
      <div className="text-center text-2xl text-white/80">
        <p>Content not found.</p>
        <p className="text-lg">
          Please check your selection.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full text-center">
      <h1
        className={cn(
          'font-headline font-bold text-white drop-shadow-md',
          typeof verseText === 'string'
            ? 'text-5xl md:text-7xl lg:text-8xl'
            : 'text-2xl md:text-3xl lg:text-4xl'
        )}
      >
        {typeof verseText === 'string'
          ? verseText
          : Object.entries(verseText)
              .map(([num, text]) => `(${num}) ${text}`)
              .join(' ')}
      </h1>
      <p className="mt-8 text-2xl md:text-4xl lg:text-5xl font-semibold text-white/70 drop-shadow">
        {bookName} {chapterNumber}
        {verseNumber ? `:${verseNumber}` : ''}
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
  const ver = (searchParams.ver as Version) || 'kjv';
  const book = (searchParams.book as string) || 'Genesis';
  const chap = (searchParams.chap as string) || '1';
  const v = searchParams.v as string | undefined;

  return (
    <main className="flex h-dvh w-full items-center justify-center bg-primary p-8">
      <Suspense
        fallback={<div className="text-white text-4xl">Loading...</div>}
      >
        <VerseDisplay lang={lang} ver={ver} book={book} chap={chap} v={v} />
      </Suspense>
    </main>
  );
}
