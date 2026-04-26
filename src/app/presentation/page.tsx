'use client';

import { useState, useEffect, useMemo } from 'react';
import { getChapterText, getVerse } from '@/lib/bible';
import { cn } from '@/lib/utils';
import type { LanguageCode, Version } from '@/lib/bible';

function VerseDisplay({
  lang,
  ver,
  book,
  chap,
  verses,
  verseRangeStart,
  verseRangeEnd,
  fontSize,
  textColor,
  bgColor,
  textAlign,
}: {
  lang: LanguageCode;
  ver: Version;
  book: string;
  chap: string;
  verses?: string[];
  verseRangeStart?: number;
  verseRangeEnd?: number;
  fontSize: number;
  textColor: string;
  bgColor: string;
  textAlign: 'left' | 'center' | 'right';
}) {
  const [verseText, setVerseText] = useState<string | { [key: string]: string } | null>(null);
  const [bookName, setBookName] = useState(book);
  const [chapterNumber, setChapterNumber] = useState(chap);
  const [verseNumber, setVerseNumber] = useState(verses?.join(','));

  useEffect(() => {
    const loadContent = () => {
      let text: string | { [key: string]: string } | undefined;
      let bName = book;
      let cNum = chap;
      let vNum: string | undefined;

      if (verses && verses.length > 0) {
        if (verses.length === 1) {
          const verseContent = getVerse(ver, book, chap, verses[0]);
          if (verseContent) {
            text = verseContent;
            vNum = verses[0];
          }
        } else {
          const verseMap: { [key: string]: string } = {};
          verses.forEach(verse => {
            const verseContent = getVerse(ver, book, chap, verse);
            if (verseContent) {
              verseMap[verse] = verseContent;
            }
          });
          if (Object.keys(verseMap).length > 0) {
            text = verseMap;
            vNum = verses.join(',');
          }
        }
      } else {
        const chapterContent = getChapterText(ver, book, chap);
        if (chapterContent) {
          text = chapterContent;
        }
      }

      setVerseText(text || null);
      setBookName(bName);
      setChapterNumber(cNum);
      setVerseNumber(vNum);
    };

    loadContent();
  }, [ver, book, chap, verses]);

  if (!verseText || (typeof verseText !== 'string' && Object.keys(verseText).length === 0)) {
    return (
      <div className="text-center text-2xl" style={{ color: textColor }}>
        <p>Content not found.</p>
        <p className="text-lg">
          Please check your selection.
        </p>
      </div>
    );
  }

  const displayFontSize = typeof verseText === 'string' ? fontSize : Math.min(fontSize * 0.6, 48);

  return (
    <div className="w-full h-full flex flex-col justify-center overflow-y-auto">
      <h1
        className={cn(
          'font-headline font-bold drop-shadow-md',
          typeof verseText === 'string'
            ? 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl'
            : 'text-xl sm:text-2xl md:text-3xl lg:text-4xl',
          textAlign === 'left' && 'text-left',
          textAlign === 'center' && 'text-center',
          textAlign === 'right' && 'text-right'
        )}
        style={{
          color: textColor,
          fontSize: typeof verseText === 'string' ? `${displayFontSize}px` : undefined,
          textAlign: textAlign,
        }}
      >
        {typeof verseText === 'string'
          ? verseText
          : Object.entries(verseText)
              .map(([num, text]) => `(${num}) ${text}`)
              .join(' ')}
      </h1>
      <p
        className={cn(
          "mt-8 text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold drop-shadow",
          textAlign === 'left' && 'text-left',
          textAlign === 'center' && 'text-center',
          textAlign === 'right' && 'text-right'
        )}
        style={{ 
          color: textColor + 'b3', // semi-transparent
          textAlign: textAlign,
        }}
      >
        {bookName} {chapterNumber}
        {verseNumber ? `:${verseNumber}` : ''}
      </p>
    </div>
  );
}

export default function PresentationPage() {
  const [lang, setLang] = useState<LanguageCode>('en');
  const [ver, setVer] = useState<Version>('kjv');
  const [book, setBook] = useState('Genesis');
  const [chap, setChap] = useState('1');
  const [verses, setVerses] = useState<string[]>([]);
  const [verseRangeStart, setVerseRangeStart] = useState<number | undefined>();
  const [verseRangeEnd, setVerseRangeEnd] = useState<number | undefined>();
  const [fontSize, setFontSize] = useState(72);
  const [textColor, setTextColor] = useState('#ffffff');
  const [bgColor, setBgColor] = useState('#000000');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');

  // Listen for postMessage updates from the main reader
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'UPDATE_VERSES') {
        const { lang: newLang, ver: newVer, book: newBook, chap: newChap, verses: newVerses, verseRangeStart: newStart, verseRangeEnd: newEnd, fontSize: newFontSize, textColor: newTextColor, bgColor: newBgColor, textAlign: newTextAlign } = event.data.payload;
        if (newLang) setLang(newLang);
        if (newVer) setVer(newVer);
        if (newBook) setBook(newBook);
        if (newChap) setChap(newChap);
        setVerses(newVerses || []);
        setVerseRangeStart(newStart);
        setVerseRangeEnd(newEnd);
        if (newFontSize !== undefined) setFontSize(newFontSize);
        if (newTextColor) setTextColor(newTextColor);
        if (newBgColor) setBgColor(newBgColor);
        if (newTextAlign) setTextAlign(newTextAlign);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Parse initial values from URL on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlLang = (params.get('lang') || 'en') as LanguageCode;
    const urlVer = (params.get('ver') || 'kjv') as Version;
    const urlBook = params.get('book') || 'Genesis';
    const urlChap = params.get('chap') || '1';
    const urlVerses = params.get('v') ? params.get('v')!.split(',').filter(Boolean) : [];
    const urlStart = params.get('vstart') ? parseInt(params.get('vstart')!) : undefined;
    const urlEnd = params.get('vend') ? parseInt(params.get('vend')!) : undefined;

    setLang(urlLang);
    setVer(urlVer);
    setBook(urlBook);
    setChap(urlChap);
    setVerses(urlVerses);
    setVerseRangeStart(urlStart);
    setVerseRangeEnd(urlEnd);

    // Load settings from localStorage
    const savedFontSize = localStorage.getItem('presentation-fontSize');
    const savedTextColor = localStorage.getItem('presentation-textColor');
    const savedBgColor = localStorage.getItem('presentation-bgColor');
    const savedTextAlign = localStorage.getItem('presentation-textAlign');

    if (savedFontSize) setFontSize(parseInt(savedFontSize));
    if (savedTextColor) setTextColor(savedTextColor);
    if (savedBgColor) setBgColor(savedBgColor);
    if (savedTextAlign) setTextAlign(savedTextAlign as 'left' | 'center' | 'right');
  }, []);

  return (
    <main
      className="flex h-dvh w-full items-center justify-center p-4 sm:p-8"
      style={{ backgroundColor: bgColor }}
    >
      <div className="w-full h-full max-w-4xl">
        <VerseDisplay
          lang={lang}
          ver={ver}
          book={book}
          chap={chap}
          verses={verses}
          verseRangeStart={verseRangeStart}
          verseRangeEnd={verseRangeEnd}
          fontSize={fontSize}
          textColor={textColor}
          bgColor={bgColor}
          textAlign={textAlign}
        />
      </div>
    </main>
  );
}
