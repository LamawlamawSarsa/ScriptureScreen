
'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Book,
  ChevronLeft,
  ChevronRight,
  MonitorPlay,
  Search,
  Settings,
  Palette,
  Plus,
} from 'lucide-react';

import { useBibleNavigation } from '@/hooks/use-bible-navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { ContextualVerseFinder } from '@/components/contextual-verse-finder';
import { Input } from '@/components/ui/input';
import { search } from '@/app/actions';
import type { SearchResult } from '@/lib/bible';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from './ui/scroll-area';
import { Skeleton } from './ui/skeleton';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

export function BibleReader() {
  const {
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
    isLoading,
  } = useBibleNavigation();

  const [selectedVerses, setSelectedVerses] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [presentationWindow, setPresentationWindow] = useState<Window | null>(null);
  const [fontSize, setFontSize] = useState(72);
  const [textColor, setTextColor] = useState('#ffffff');
  const [bgColor, setBgColor] = useState('#000000');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [verseRangeStart, setVerseRangeStart] = useState<number>(1);
  const [verseRangeEnd, setVerseRangeEnd] = useState<number>(10);
  const [showVerseRange, setShowVerseRange] = useState(false);

  // Load presentation settings from localStorage
  useEffect(() => {
    const savedFontSize = localStorage.getItem('presentation-fontSize');
    const savedTextColor = localStorage.getItem('presentation-textColor');
    const savedBgColor = localStorage.getItem('presentation-bgColor');
    const savedTextAlign = localStorage.getItem('presentation-textAlign');

    if (savedFontSize) setFontSize(parseInt(savedFontSize));
    if (savedTextColor) setTextColor(savedTextColor);
    if (savedBgColor) setBgColor(savedBgColor);
    if (savedTextAlign) setTextAlign(savedTextAlign as 'left' | 'center' | 'right');
  }, []);

  // Get verses for current range
  const versesInRange = useMemo(() => {
    if (!showVerseRange || !currentChapterText) return selectedVerses;
    
    const verseNumbers = Object.keys(currentChapterText)
      .map(v => parseInt(v))
      .sort((a, b) => a - b);
    
    return verseNumbers
      .filter(v => v >= verseRangeStart && v <= verseRangeEnd)
      .map(v => v.toString());
  }, [showVerseRange, verseRangeStart, verseRangeEnd, currentChapterText, selectedVerses]);

  // Send presentation updates via postMessage
  const sendPresentationUpdate = () => {
    if (!presentationWindow || presentationWindow.closed) return;
    const versesToSend = showVerseRange ? versesInRange : selectedVerses;
    presentationWindow.postMessage(
      {
        type: 'UPDATE_VERSES',
        payload: {
          lang,
          ver,
          book,
          chap,
          verses: versesToSend,
          verseRangeStart: showVerseRange ? verseRangeStart : undefined,
          verseRangeEnd: showVerseRange ? verseRangeEnd : undefined,
          fontSize,
          textColor,
          bgColor,
          textAlign,
        },
      },
      '*'
    );
  };

  useEffect(() => {
    sendPresentationUpdate();
  }, [selectedVerses, versesInRange, book, chap, lang, ver, fontSize, textColor, bgColor, presentationWindow, showVerseRange, verseRangeStart, verseRangeEnd, textAlign]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      const results = await search(ver, query);
      setSearchResults(results);
      if (!isSearchOpen) setIsSearchOpen(true);
    } else {
      setSearchResults([]);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    goTo({ book: result.book, chapter: result.chapter });
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchOpen(false);
    setTimeout(() => {
      document.getElementById(`verse-${result.verse}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      setSelectedVerses([result.verse]);
    }, 100);
  };

  const handleChapterChange = (offset: number) => {
    const currentIndex = availableChapters.findIndex(c => c.id === chap);
    const newIndex = currentIndex + offset;
    if (newIndex >= 0 && newIndex < availableChapters.length) {
      setChapter(availableChapters[newIndex].id);
      setSelectedVerses([]);
    }
  };

  const saveSettings = () => {
    localStorage.setItem('presentation-fontSize', fontSize.toString());
    localStorage.setItem('presentation-textColor', textColor);
    localStorage.setItem('presentation-bgColor', bgColor);
    localStorage.setItem('presentation-textAlign', textAlign);
  };

  // Navigate to next verse range
  const goToNextRange = () => {
    const rangeSize = verseRangeEnd - verseRangeStart + 1;
    setVerseRangeStart(verseRangeEnd + 1);
    setVerseRangeEnd(verseRangeEnd + rangeSize);
  };

  // Navigate to previous verse range
  const goToPrevRange = () => {
    if (verseRangeStart <= 1) return;
    const rangeSize = verseRangeEnd - verseRangeStart + 1;
    setVerseRangeStart(Math.max(1, verseRangeStart - rangeSize));
    setVerseRangeEnd(verseRangeStart - 1);
  };

  const openPresentation = () => {
    const rangeSuffix = showVerseRange ? `&vstart=${verseRangeStart}&vend=${verseRangeEnd}` : '';
    const versesToSend = showVerseRange ? versesInRange : selectedVerses;
    const params = createQueryString({
      lang,
      ver,
      book,
      chap,
      v: versesToSend.length ? versesToSend.join(',') : undefined,
    });
    const newWindow = window.open(`/presentation?${params}${rangeSuffix}`, '_blank');
    if (newWindow) {
      setPresentationWindow(newWindow);
      setTimeout(() => {
        if (!newWindow.closed) {
          newWindow.postMessage(
            {
              type: 'UPDATE_VERSES',
              payload: {
                lang,
                ver,
                book,
                chap,
                verses: versesToSend,
                verseRangeStart: showVerseRange ? verseRangeStart : undefined,
                verseRangeEnd: showVerseRange ? verseRangeEnd : undefined,
                fontSize,
                textColor,
                bgColor,
              },
            },
            '*'
          );
        }
      }, 300);
    }
  };

  const sortedChapterText = useMemo(() => {
    if (!currentChapterText) return [];
    let verses = Object.entries(currentChapterText).sort(([a], [b]) => {
      return parseInt(a) - parseInt(b);
    });
    
    // Filter to verse range if in range mode
    if (showVerseRange) {
      verses = verses.filter(([verseNum]) => {
        const num = parseInt(verseNum);
        return num >= verseRangeStart && num <= verseRangeEnd;
      });
    }
    
    return verses;
  }, [currentChapterText, showVerseRange, verseRangeStart, verseRangeEnd]);

  return (
    <div className="flex h-full flex-col">
      <header className="sticky top-0 z-10 flex flex-col gap-2 border-b bg-background/80 p-4 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-2">
            <ContextualVerseFinder />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div>
                    <Label>Font Size: {fontSize}px</Label>
                    <Slider
                      value={[fontSize]}
                      onValueChange={(value) => setFontSize(value[0])}
                      min={24}
                      max={120}
                      step={4}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Text Color</Label>
                    <Select value={textColor} onValueChange={setTextColor}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="#ffffff">White</SelectItem>
                        <SelectItem value="#000000">Black</SelectItem>
                        <SelectItem value="#ffd700">Gold</SelectItem>
                        <SelectItem value="#ff6b6b">Coral</SelectItem>
                        <SelectItem value="#4ecdc4">Teal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Background Color</Label>
                    <Select value={bgColor} onValueChange={setBgColor}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="#000000">Black</SelectItem>
                        <SelectItem value="#ffffff">White</SelectItem>
                        <SelectItem value="#1a1a1a">Dark Gray</SelectItem>
                        <SelectItem value="#2d3748">Blue Gray</SelectItem>
                        <SelectItem value="#2f1b14">Brown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Text Alignment</Label>
                    <Select value={textAlign} onValueChange={(value: 'left' | 'center' | 'right') => setTextAlign(value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={saveSettings} className="w-full">
                    <Palette className="mr-2 h-4 w-4" />
                    Save Settings
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button onClick={openPresentation} disabled={!currentChapterText}>
              <MonitorPlay className="mr-2 h-4 w-4" />
              Present
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-5 md:items-center lg:flex lg:gap-4">
          <Select
            value={lang}
            onValueChange={setLanguage as (value: string) => void}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              {availableLanguages.map(l => (
                <SelectItem key={l.code} value={l.code}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={ver}
            onValueChange={setVersion as (value: string) => void}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Version" />
            </SelectTrigger>
            <SelectContent>
              {availableVersions.map(v => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name} ({v.abbreviation})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={book} onValueChange={setBook} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Book" />
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="h-72">
                {availableBooks.map(b => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>

          <Select value={chap} onValueChange={setChapter} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Chapter" />
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="h-72">
                {availableChapters.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>

          <div className="col-span-2 md:col-span-1 lg:ml-auto">
            <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="w-full md:w-10">
                  <Search className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search keyword..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={e => handleSearch(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>
                <ScrollArea className="max-h-80">
                  {searchResults.length > 0 ? (
                    <div className="p-2 pt-0">
                      {searchResults.map((result, i) => (
                        <button
                          key={i}
                          onClick={() => handleResultClick(result)}
                          className="w-full text-left p-2 rounded-md hover:bg-accent"
                        >
                          <p className="font-semibold text-primary">
                            {result.book} {result.chapter}:{result.verse}
                          </p>
                          <p
                            className="text-sm text-muted-foreground truncate"
                            dangerouslySetInnerHTML={{
                              __html: result.text.replace(
                                new RegExp(searchQuery, 'gi'),
                                match =>
                                  `<strong class="text-accent-foreground bg-accent/50">${match}</strong>`
                              ),
                            }}
                          ></p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="p-4 text-center text-sm text-muted-foreground">
                      {searchQuery.length > 2
                        ? 'No results found.'
                        : 'Type to search.'}
                    </p>
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Verse Range Navigation */}
        {showVerseRange && currentChapterText && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevRange}
              disabled={verseRangeStart <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Prev
            </Button>
            <span className="text-sm font-medium px-3 py-2 rounded-md bg-secondary">
              Verses {verseRangeStart} - {verseRangeEnd}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextRange}
              disabled={verseRangeEnd >= Math.max(...Object.keys(currentChapterText).map(v => parseInt(v)))}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Verse Range Toggle */}
        <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
          <Button
            variant={showVerseRange ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setShowVerseRange(!showVerseRange);
              if (!showVerseRange) {
                setSelectedVerses([]);
              }
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            {showVerseRange ? 'Selecting Range' : 'Select Range'}
          </Button>
          {showVerseRange && (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                value={verseRangeStart}
                onChange={(e) => setVerseRangeStart(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 h-8 text-center text-sm"
                placeholder="Start"
              />
              <span className="text-sm font-medium">-</span>
              <Input
                type="number"
                min="1"
                value={verseRangeEnd}
                onChange={(e) => setVerseRangeEnd(Math.max(verseRangeStart, parseInt(e.target.value) || 10))}
                className="w-16 h-8 text-center text-sm"
                placeholder="End"
              />
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-4xl p-4 sm:p-6 md:p-8">
          <div className="mb-8 flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleChapterChange(-1)}
              disabled={isLoading || availableChapters.findIndex(c => c.id === chap) === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-center font-headline text-3xl font-bold text-primary sm:text-4xl">
              {isLoading || !book || !chap ? <Skeleton className="h-8 w-48" /> : `${book} ${chap}`}
            </h2>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleChapterChange(1)}
              disabled={
                isLoading ||
                availableChapters.findIndex(c => c.id === chap) ===
                  availableChapters.length - 1
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-5/6" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : currentChapterText ? (
            <div className="space-y-4 font-headline text-lg/relaxed tracking-wide sm:text-xl/relaxed">
              {sortedChapterText.map(([verseNum, text]) => (
                <p
                  key={verseNum}
                  id={`verse-${verseNum}`}
                  onClick={() => {
                    setSelectedVerses(prev =>
                      prev.includes(verseNum)
                        ? prev.filter(v => v !== verseNum)
                        : [...prev, verseNum]
                    );
                  }}
                  className={`cursor-pointer rounded-md p-2 transition-colors ${
                    selectedVerses.includes(verseNum)
                      ? 'bg-accent/20 text-primary'
                      : 'hover:bg-secondary'
                  }`}
                >
                  <sup className="mr-2 font-sans text-xs font-bold text-accent">
                    {verseNum}
                  </sup>
                  {text}
                </p>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <Book className="mx-auto mb-4 h-12 w-12" />
              <p>Select a book and chapter to start reading.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
