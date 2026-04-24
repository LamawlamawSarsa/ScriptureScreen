
'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import {
  getBooks,
  getChapters,
  getChapterText,
} from '@/app/actions';
import {
  getVersionsForLanguage,
  getAvailableLanguages,
  type LanguageCode,
  type Version,
} from '@/lib/bible';

type BibleVerseSet = { [verse: string]: string };
type Book = { id: string; name: string };
type Chapter = { id: string; name: string };

export function useBibleNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Synchronous States from URL
  const availableLanguages = useMemo(() => getAvailableLanguages(), []);
  const lang =
    (searchParams.get('lang') as LanguageCode) || availableLanguages[0].code;
  const availableVersions = useMemo(() => getVersionsForLanguage(lang), [lang]);
  const ver =
    (searchParams.get('ver') as Version) || availableVersions[0]?.id;
  const book = searchParams.get('book');
  const chap = searchParams.get('chap');

  // Asynchronous States
  const [availableBooks, setAvailableBooks] = useState<Book[]>([]);
  const [availableChapters, setAvailableChapters] = useState<Chapter[]>([]);
  const [currentChapterText, setCurrentChapterText] =
    useState<BibleVerseSet | null>(null);

  // Loading States
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [isLoadingChapters, setIsLoadingChapters] = useState(true);
  const [isLoadingText, setIsLoadingText] = useState(true);

  const createQueryString = useCallback(
    (params: Record<string, string | number | undefined>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      }
      return newSearchParams.toString();
    },
    [searchParams]
  );
  
  const setLanguage = (newLang: LanguageCode) => {
    const newVersions = getVersionsForLanguage(newLang);
    const newVer = newVersions[0]?.id;
    if (!newVer) return;
    const params = createQueryString({ lang: newLang, ver: newVer, book: null, chap: null });
    startTransition(() => {
      router.push(`${pathname}?${params}`);
    });
  };

  const setVersion = (newVer: Version) => {
    const params = createQueryString({ ver: newVer, book: null, chap: null });
     startTransition(() => {
      router.push(`${pathname}?${params}`);
    });
  };

  const setBook = (newBook: string) => {
    const params = createQueryString({ book: newBook, chap: null });
     startTransition(() => {
      router.push(`${pathname}?${params}`);
    });
  };

  const setChapter = (newChap: string) => {
    const params = createQueryString({ chap: newChap });
     startTransition(() => {
      router.push(`${pathname}?${params}`);
    });
  };

  const goTo = (location: { book: string; chapter: string }) => {
    const params = createQueryString({ book: location.book, chap: location.chapter });
    startTransition(() => {
      router.push(`${pathname}?${params}`);
    });
  };

  // Effect to fetch books when version changes
  useEffect(() => {
    if (!ver) return;
    let isMounted = true;
    setIsLoadingBooks(true);
    getBooks(ver).then(books => {
      if (isMounted) {
        setAvailableBooks(books);
        // If the current book isn't in the new list, or no book is selected, set to the first book
        const currentBookIsValid = books.some(b => b.id === book);
        if (!book || !currentBookIsValid) {
          const newBook = books[0]?.id;
          if (newBook) {
            const params = createQueryString({ book: newBook, chap: null });
            router.replace(`${pathname}?${params}`);
          }
        }
        setIsLoadingBooks(false);
      }
    });
    return () => { isMounted = false; };
  }, [ver]);

  // Effect to fetch chapters when book/version changes
  useEffect(() => {
    if (!ver || !book) {
      setAvailableChapters([]);
      setIsLoadingChapters(false);
      return;
    };
    let isMounted = true;
    setIsLoadingChapters(true);
    getChapters(ver, book).then(chapters => {
      if (isMounted) {
        setAvailableChapters(chapters);
        // If the current chapter isn't in the new list, or no chapter is selected, set to the first
        const currentChapIsValid = chapters.some(c => c.id === chap);
        if (!chap || !currentChapIsValid) {
          const newChap = chapters[0]?.id;
           if (newChap) {
            const params = createQueryString({ chap: newChap });
            router.replace(`${pathname}?${params}`);
           }
        }
        setIsLoadingChapters(false);
      }
    });
    return () => { isMounted = false; };
  }, [ver, book]);

  // Effect to fetch chapter text
  useEffect(() => {
    if (!ver || !book || !chap) {
        setCurrentChapterText(null);
        setIsLoadingText(false);
        return;
    };
    let isMounted = true;
    setIsLoadingText(true);
    getChapterText(ver, book, chap)
      .then(result => {
        if (isMounted) setCurrentChapterText(result);
      })
      .finally(() => {
        if (isMounted) setIsLoadingText(false);
      });
    return () => { isMounted = false; };
  }, [ver, book, chap]);

  return {
    lang,
    ver,
    book: book || '',
    chap: chap || '',
    setLanguage,
    setVersion,
    setBook,
    setChapter,
    goTo,
    availableLanguages,
    availableVersions,
    availableBooks,
    availableChapters,
    currentChapterText,
    createQueryString,
    isLoading: isLoadingBooks || isLoadingChapters || isLoadingText || isPending,
  };
}
