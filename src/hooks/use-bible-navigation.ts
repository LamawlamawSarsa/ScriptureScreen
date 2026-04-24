
'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getBooks,
  getChapters,
  getChapterText,
} from '@/app/actions';
import {
  getVersionsForLanguage,
  getAvailableLanguages,
  type LanguageCode,
  type VersionId,
} from '@/lib/bible';

type BibleVerseSet = { [verse: string]: string };
type Book = { id: string; name: string };
type Chapter = { id: string; name: string };

export function useBibleNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Synchronous States from URL
  const availableLanguages = useMemo(() => getAvailableLanguages(), []);
  const lang =
    (searchParams.get('lang') as LanguageCode) || availableLanguages[0].code;
  const availableVersions = useMemo(() => getVersionsForLanguage(lang), [lang]);
  const ver =
    (searchParams.get('ver') as VersionId) || availableVersions[0]?.id;
  const book = searchParams.get('book'); // Now a book ID
  const chap = searchParams.get('chap'); // Now a chapter ID

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
        if (value === undefined) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      }
      return newSearchParams.toString();
    },
    [searchParams]
  );
  
  const setLanguage = useCallback((newLang: LanguageCode) => {
    const newVersions = getVersionsForLanguage(newLang);
    const newVersionId = newVersions[0]?.id;
    if (!newVersionId) return;
    router.push(`${pathname}?lang=${newLang}&ver=${newVersionId}`);
  }, [router, pathname]);

  const setVersion = useCallback((newVer: VersionId) => {
    router.push(`${pathname}?lang=${lang}&ver=${newVer}`);
  }, [router, pathname, lang]);

  const setBook = useCallback((newBookId: string) => {
    router.push(`${pathname}?${createQueryString({ book: newBookId, chap: undefined })}`);
  }, [router, pathname, createQueryString]);

  const setChapter = useCallback((newChapId: string) => {
    router.push(`${pathname}?${createQueryString({ chap: newChapId })}`);
  }, [router, pathname, createQueryString]);

  const goTo = useCallback((location: { book: string; chapter: string }) => {
    router.push(`${pathname}?${createQueryString({ book: location.book, chap: location.chapter })}`);
  }, [router, pathname, createQueryString]);


  // Effect to fetch books when version changes
  useEffect(() => {
    if (!ver) {
      setAvailableBooks([]);
      setIsLoadingBooks(false);
      return;
    }
    let isMounted = true;
    setIsLoadingBooks(true);
    getBooks(ver)
      .then(books => {
        if (isMounted) setAvailableBooks(books);
      })
      .finally(() => {
        if (isMounted) setIsLoadingBooks(false);
      });
    return () => { isMounted = false; };
  }, [ver]);

  // Effect to set book if current one is invalid or not set
  useEffect(() => {
    if (isLoadingBooks || !availableBooks.length) return;
    const bookIdExists = availableBooks.some(b => b.id === book);
    if (!book || !bookIdExists) {
      setBook(availableBooks[0].id);
    }
  }, [availableBooks, book, setBook, isLoadingBooks]);

  // Effect to fetch chapters when book/version changes
  useEffect(() => {
    if (!ver || !book) {
      setAvailableChapters([]);
      setIsLoadingChapters(false);
      return;
    }
    let isMounted = true;
    setIsLoadingChapters(true);
    getChapters(ver, book)
      .then(chapters => {
        if (isMounted) setAvailableChapters(chapters);
      })
      .finally(() => {
        if (isMounted) setIsLoadingChapters(false);
      });
    return () => { isMounted = false; };
  }, [ver, book]);

  // Effect to set chapter if current one is invalid or not set
  useEffect(() => {
    if (isLoadingChapters || !availableChapters.length) return;
    const chapIdExists = availableChapters.some(c => c.id === chap);
    if (!chap || !chapIdExists) {
      setChapter(availableChapters[0].id);
    }
  }, [availableChapters, chap, setChapter, isLoadingChapters]);

  // Effect to fetch chapter text
  useEffect(() => {
    if (!ver || !chap) {
        setCurrentChapterText(null);
        setIsLoadingText(false);
        return;
    };
    let isMounted = true;
    setIsLoadingText(true);
    getChapterText(ver, chap)
      .then(result => {
        if (isMounted) setCurrentChapterText(result.text);
      })
      .finally(() => {
        if (isMounted) setIsLoadingText(false);
      });
    return () => { isMounted = false; };
  }, [ver, chap]);

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
    isLoading: isLoadingBooks || isLoadingChapters || isLoadingText,
  };
}
