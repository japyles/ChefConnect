import { NextResponse } from 'next/server';

export async function GET() {
  // Stub: always return not favorited
  return NextResponse.json({ favorited: false });
}

export async function POST() {
  // Stub: toggle favorite (no-op)
  return NextResponse.json({ favorited: true });
}
