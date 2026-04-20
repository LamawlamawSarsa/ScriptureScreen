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

  // Effects to fetch data when dependencies change
  useEffect(() => {
    if (!ver) return;
    setIsLoadingBooks(true);
    getBooks(ver)
      .then(books => {
        setAvailableBooks(books);
        if (!book || !books.includes(book)) {
          // If no book is selected or the current book isn't in the new version, select the first one.
          // This will trigger the other useEffects.
          setBook(books[0]);
        }
      })
      .finally(() => setIsLoadingBooks(false));
  }, [ver]);

  useEffect(() => {
    if (!ver || !book) return;
    setIsLoadingChapters(true);
    getChapters(ver, book)
      .then(chapters => {
        setAvailableChapters(chapters);
        if (!chap || !chapters.includes(chap)) {
          // If no chapter is selected or current chapter isn't in the new book, select the first one.
          setChapter(chapters[0] || '1');
        }
      })
      .finally(() => setIsLoadingChapters(false));
  }, [ver, book]);

  useEffect(() => {
    if (!ver || !book || !chap) return;
    setIsLoadingText(true);
    getChapterText(ver, book, chap)
      .then(text => {
        setCurrentChapterText(text);
      })
      .finally(() => setIsLoadingText(false));
  }, [ver, book, chap]);

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

  const navigate = (params: Record<string, string | number | undefined>) => {
    router.push(pathname + '?' + createQueryString(params));
  };

  const setLanguage = (newLang: LanguageCode) => {
    const newVersions = getVersionsForLanguage(newLang);
    const newVersionId = newVersions[0]?.id;
    if (!newVersionId) return;
    // Let the useEffects handle the book/chapter reset
    navigate({
      lang: newLang,
      ver: newVersionId,
      book: undefined,
      chap: undefined,
    });
  };

  const setVersion = (newVer: VersionId) => {
    // Let the useEffects handle the book/chapter reset
    navigate({ ver: newVer, book: undefined, chap: undefined });
  };

  const setBook = (newBook: string) => {
    navigate({ book: newBook, chap: undefined });
  };

  const setChapter = (newChap: string) => {
    navigate({ chap: newChap });
  };

  const goTo = (location: { book: string; chapter: string }) => {
    navigate({ book: location.book, chap: location.chapter });
  };

  return {
    lang,
    ver,
    book: book || availableBooks[0] || '',
    chap: chap || availableChapters[0] || '1',
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
