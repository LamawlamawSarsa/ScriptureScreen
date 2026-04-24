import { NextResponse } from 'next/server';
import { getVerse } from '@/lib/bible';

// Expected book and chapter counts for validation
const BOOK_CHAPTER_COUNTS: Record<string, number> = {
  Genesis: 50,
  Psalms: 150,
  Revelation: 22,
};
const TOTAL_BOOKS = 66;
const MIN_KJV_VERSES = 31100;

export async function GET() {
  const response = {
    message:
      'The Bible data validation endpoint has been removed as the app now fetches data from an external API. Please test the API provider directly for data integrity.',
  };

  return NextResponse.json(response);
}
