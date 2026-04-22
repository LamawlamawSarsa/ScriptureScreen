'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getBooks,
  getChapters,
  getChapterText,
  getVersionsForLanguage,
  getAvailableLanguages,
  type LanguageCode,
  type VersionId,
  type BibleData,
} from '@/lib/bible';

export function useBibleNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Synchronous States
  const availableLanguages = useMemo(() => getAvailableLanguages(), []);
  const lang =
    (searchParams.get('lang') as LanguageCode) || availableLanguages[0].code;
  const availableVersions = useMemo(() => getVersionsForLanguage(lang), [lang]);
  const ver =
    (searchParams.get('ver') as VersionId) || availableVersions[0]?.id;
  const book = searchParams.get('book');
  const chap = searchParams.get('chap');

  // Asynchronous States
  const [availableBooks, setAvailableBooks] = useState<string[]>([]);
  const [availableChapters, setAvailableChapters] = useState<string[]>([]);
  const [currentChapterText, setCurrentChapterText] = useState<
    BibleData[string][string] | null
  >(null);

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
    const params = new URLSearchParams();
    params.set('lang', newLang);
    params.set('ver', newVersionId);
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname]);

  const setVersion = useCallback((newVer: VersionId) => {
    const params = new URLSearchParams(window.location.search);
    params.set('ver', newVer);
    params.delete('book');
    params.delete('chap');
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname]);

  const setBook = useCallback((newBook: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set('book', newBook);
    params.delete('chap');
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname]);

  const setChapter = useCallback((newChap: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set('chap', newChap);
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname]);

  const goTo = useCallback((location: { book: string; chapter: string }) => {
    const params = new URLSearchParams(window.location.search);
    params.set('book', location.book);
    params.set('chap', location.chapter);
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname]);


  // Effect to fetch books when version changes
  useEffect(() => {
    if (!ver) return;
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

  // Effect to set book if current one is invalid
  useEffect(() => {
    if (availableBooks.length > 0 && (!book || !availableBooks.includes(book))) {
      setBook(availableBooks[0]);
    }
  }, [availableBooks, book, setBook]);

  // Effect to fetch chapters when book/version changes
  useEffect(() => {
    if (!ver || !book) return;
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

  // Effect to set chapter if current one is invalid
  useEffect(() => {
    if (availableChapters.length > 0 && (!chap || !availableChapters.includes(chap))) {
      setChapter(availableChapters[0] || '1');
    }
  }, [availableChapters, chap, setChapter]);

  // Effect to fetch chapter text
  useEffect(() => {
    if (!ver || !book || !chap) {
        setCurrentChapterText(null);
        return;
    };
    let isMounted = true;
    setIsLoadingText(true);
    getChapterText(ver, book, chap)
      .then(text => {
        if (isMounted) setCurrentChapterText(text);
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
    isLoading: isLoadingBooks || isLoadingChapters || isLoadingText,
  };
}
