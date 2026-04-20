'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import {
  getBooks,
  getChapters,
  getChapterText,
  getVersionsForLanguage,
  getAvailableLanguages,
  type LanguageCode,
  type VersionId,
} from '@/lib/bible';

export function useBibleNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const availableLanguages = useMemo(() => getAvailableLanguages(), []);
  const lang =
    (searchParams.get('lang') as LanguageCode) || availableLanguages[0].code;

  const availableVersions = useMemo(() => getVersionsForLanguage(lang), [lang]);
  const ver =
    (searchParams.get('ver') as VersionId) || availableVersions[0]?.id;

  const availableBooks = useMemo(() => getBooks(ver), [ver]);
  const book = searchParams.get('book') || availableBooks[0];

  const availableChapters = useMemo(() => getChapters(ver, book), [ver, book]);
  const chap = searchParams.get('chap') || availableChapters[0] || '1';

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

  const setLanguage = (newLang: LanguageCode) => {
    const newVersions = getVersionsForLanguage(newLang);
    const newVersionId = newVersions[0]?.id;
    if (!newVersionId) return;
    const newBooks = getBooks(newVersionId);
    const newBook = newBooks[0];
    router.push(
      pathname +
        '?' +
        createQueryString({
          lang: newLang,
          ver: newVersionId,
          book: newBook,
          chap: '1',
        })
    );
  };

  const setVersion = (newVer: VersionId) => {
    const newBooks = getBooks(newVer);
    const newBook = newBooks[0];
    router.push(
      pathname +
        '?' +
        createQueryString({
          ver: newVer,
          book: newBook,
          chap: '1',
        })
    );
  };

  const setBook = (newBook: string) => {
    const newChapters = getChapters(ver, newBook);
    router.push(
      pathname +
        '?' +
        createQueryString({
          book: newBook,
          chap: newChapters[0] || '1',
        })
    );
  };

  const setChapter = (newChap: string) => {
    router.push(pathname + '?' + createQueryString({ chap: newChap }));
  };

  const goTo = (location: { book: string; chapter: string }) => {
    router.push(
      pathname +
        '?' +
        createQueryString({
          book: location.book,
          chap: location.chapter,
        })
    );
  };

  const currentChapterText = useMemo(
    () => getChapterText(ver, book, chap),
    [ver, book, chap]
  );

  return {
    lang,
    ver,
    book,
    chap,
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
  };
}
