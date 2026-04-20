import { NextResponse } from 'next/server';
import { validateVersion } from '@/lib/bible';

export async function GET() {
  // We'll test the KJV version as an example
  const validationResult = await validateVersion('KJV');

  const response = {
    message:
      'This endpoint validates the completeness of a given Bible version. The current dataset is a sample. To pass all checks, the corresponding JSON file (e.g., src/data/bible/kjv.json) must contain the complete Bible text.',
    ...validationResult,
  };

  // We return a 200 OK status regardless of validation pass/fail,
  // the client can inspect the 'overallPass' boolean in the response body.
  return NextResponse.json(response);
}
