'use client';

import { useState, useMemo } from 'react';
import {
  Book,
  ChevronLeft,
  ChevronRight,
  MonitorPlay,
  Search,
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
import { search, type SearchResult } from '@/lib/bible';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from './ui/scroll-area';
import { Skeleton } from './ui/skeleton';

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

  const [selectedVerse, setSelectedVerse] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      const results = await search(ver, query);
      setSearchResults(results);
      setIsSearchOpen(true);
    } else {
      setSearchResults([]);
      setIsSearchOpen(false);
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
      setSelectedVerse(result.verse);
    }, 100);
  };

  const handleChapterChange = (offset: number) => {
    const currentIndex = availableChapters.indexOf(chap);
    const newIndex = currentIndex + offset;
    if (newIndex >= 0 && newIndex < availableChapters.length) {
      setChapter(availableChapters[newIndex]);
      setSelectedVerse(null);
    }
  };

  const openPresentation = () => {
    const params = createQueryString({
      lang,
      ver,
      book,
      chap,
      v: selectedVerse || undefined,
    });
    window.open(`/presentation?${params}`, '_blank', 'noopener,noreferrer');
  };

  const sortedChapterText = useMemo(() => {
    if (!currentChapterText) return [];
    return Object.entries(currentChapterText).sort(([a], [b]) => {
      return parseInt(a) - parseInt(b);
    });
  }, [currentChapterText]);

  return (
    <div className="flex h-full flex-col">
      <header className="sticky top-0 z-10 flex flex-col gap-2 border-b bg-background/80 p-4 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-2">
            <ContextualVerseFinder />
            <Button onClick={openPresentation} disabled={!currentChapterText}>
              <MonitorPlay className="mr-2 h-4 w-4" />
              Present
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:flex lg:items-center lg:gap-4">
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
                  <SelectItem key={b} value={b}>
                    {b}
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
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>

          <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <PopoverTrigger asChild>
              <div className="relative lg:flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search keyword..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={e => handleSearch(e.target.value)}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="w-[--radix-popover-trigger-width] p-0"
              align="start"
            >
              <ScrollArea className="max-h-80">
                {searchResults.length > 0 ? (
                  <div className="p-2">
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
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-4xl p-4 sm:p-6 md:p-8">
          <div className="mb-8 flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleChapterChange(-1)}
              disabled={isLoading || availableChapters.indexOf(chap) === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-center font-headline text-3xl font-bold text-primary sm:text-4xl">
              {isLoading ? <Skeleton className="h-8 w-48" /> : `${book} ${chap}`}
            </h2>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleChapterChange(1)}
              disabled={
                isLoading ||
                availableChapters.indexOf(chap) ===
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
                  onClick={() =>
                    setSelectedVerse(
                      verseNum === selectedVerse ? null : verseNum
                    )
                  }
                  className={`cursor-pointer rounded-md p-2 transition-colors ${
                    selectedVerse === verseNum
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
