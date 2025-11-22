import { NextResponse } from 'next/server'

export async function GET() {
  const hasEnv = !!process.env.DATABASE_URL
  return NextResponse.json({ envConfigured: hasEnv })
}