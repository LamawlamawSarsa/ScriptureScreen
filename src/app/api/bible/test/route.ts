import { NextResponse } from 'next/server';

export async function GET() {
  const response = {
    message:
      'The Bible data validation endpoint has been removed as the app now fetches data from an external API. Please test the API provider directly for data integrity.',
  };

  return NextResponse.json(response);
}
