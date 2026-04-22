import { NextResponse } from 'next/server';
import { validateVersion } from '@/lib/bible';

export async function GET() {
  // We'll test the KJV version as an example
  const validationResult = await validateVersion('KJV');

  const { overallPass, totalVerseCount, checks } = validationResult;

  const response = {
    message:
      'This endpoint validates the completeness of a given Bible version by fetching it from its online source and running a series of checks. A full, valid Bible will pass all checks.',
    versionId: validationResult.versionId,
    overallPass,
    totalVerseCount,
    checks,
  };

  // We return a 200 OK status regardless of validation pass/fail,
  // the client can inspect the 'overallPass' boolean in the response body.
  return NextResponse.json(response);
}
