import { getChapterText, getVerse } from '@/lib/bible';
import { cn } from '@/lib/utils';
import type { LanguageCode, VersionId } from '@/lib/bible';
import { Suspense } from 'react';

async function VerseDisplay({
  lang,
  ver,
  book, // book ID
  chap, // chapter ID
  v,
}: {
  lang: LanguageCode;
  ver: VersionId;
  book: string;
  chap: string;
  v?: string;
}) {
  const isSingleVerse = !!v;
  let verseText, bookName, chapterNumber;

  if (isSingleVerse) {
    // TODO: getVerse needs to be implemented to fetch single verses efficiently
    const verseContent = await getVerse(ver, v);
    verseText = verseContent;
    // For now, bookName and chapterNumber will be incorrect for single verse display
    bookName = '...';
    chapterNumber = '...';
  } else {
    const chapterContent = await getChapterText(ver, chap);
    verseText = chapterContent.text;
    bookName = chapterContent.bookName;
    chapterNumber = chapterContent.chapterNumber;
  }

  if (!verseText) {
    return (
      <div className="text-center text-2xl text-white/80">
        <p>Content not found.</p>
        <p className="text-lg">
          Please check your selection and API configuration.
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
  // These are now IDs from the API
  const lang = (searchParams.lang as LanguageCode) || 'en';
  const ver = (searchParams.ver as VersionId) || 'de4e12af7f28f599-01'; // Default KJV
  const book = (searchParams.book as string) || 'GEN'; // Default Genesis ID
  const chap = (searchParams.chap as string) || 'GEN.1'; // Default Genesis 1 ID
  const v = searchParams.v as string | undefined;

  return (
    <main className="flex h-dvh w-full items-center justify-center bg-primary p-8">
      <Suspense
        fallback={<div className="text-white text-4xl">Loading...</div>}
      >
        <VerseDisplay lang={lang} ver={ver} book={book} chap={chap} v={v} />
      </Suspapse>
    </main>
  );
}
