import { NextRequest, NextResponse } from 'next/server';

const redis = require('redis');

// Simple in-memory storage (replace with Redis in production)
const userClaims = new Map<string, { claimCount: number; lastClaimDate: string }>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');

    if (!fid) {
      return NextResponse.json({ error: 'FID is required' }, { status: 400 });
    }

    const claims = userClaims.get(fid) || { claimCount: 0, lastClaimDate: '' };

    return NextResponse.json(claims);
  } catch (error) {
    console.error('Claims API error:', error);
    return NextResponse.json({ error: 'Failed to fetch claims' }, { status: 500 });
  }
}