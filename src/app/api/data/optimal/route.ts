// Deprecated endpoint: Optimal API is no longer supported.
import { NextResponse } from 'next/server';

export async function GET() {

  return NextResponse.json({ error: 'Optimal API is no longer supported.' }, { status: 404 });
}


