'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import {
  bibleData,
  getBooks,
  getChapters,
  getChapterText,
  getVersionsForLanguage,
  BIBLE_LANGUAGES,
  type LanguageCode,
  type VersionName,
} from '@/lib/bible';

export function useBibleNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const lang = (searchParams.get('lang') as LanguageCode) || 'en';
  const ver =
    (searchParams.get('ver') as VersionName) ||
    getVersionsForLanguage(lang)[0];
  const book = searchParams.get('book') || getBooks(lang, ver)[0];
  const chap = searchParams.get('chap') || '1';

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
    const newVersion = newVersions[0];
    const newBooks = getBooks(newLang, newVersion);
    const newBook = newBooks[0];
    router.push(
      pathname +
        '?' +
        createQueryString({
          lang: newLang,
          ver: newVersion,
          book: newBook,
          chap: '1',
        })
    );
  };

  const setVersion = (newVer: VersionName) => {
    const newBooks = getBooks(lang, newVer);
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
    router.push(
      pathname +
        '?' +
        createQueryString({
          book: newBook,
          chap: '1',
        })
    );
  };

  const setChapter = (newChap: string) => {
    router.push(pathname + '?' + createQueryString({ chap: newChap }));
  };
  
  const goTo = (location: {book: string, chapter: string}) => {
     router.push(
      pathname +
        '?' +
        createQueryString({
          book: location.book,
          chap: location.chapter,
        })
    );
  }

  const availableLanguages = BIBLE_LANGUAGES;
  const availableVersions = useMemo(
    () => getVersionsForLanguage(lang),
    [lang]
  );
  const availableBooks = useMemo(() => getBooks(lang, ver), [lang, ver]);
  const availableChapters = useMemo(
    () => getChapters(lang, ver, book),
    [lang, ver, book]
  );

  const currentChapterText = useMemo(
    () => getChapterText(lang, ver, book, chap),
    [lang, ver, book, chap]
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
