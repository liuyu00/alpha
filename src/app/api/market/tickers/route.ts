import { NextResponse } from 'next/server';
import {prisma} from '@/lib/db';
import { fetchMultipleTickers } from '@/services/binanceService';

export async function GET() {
  try {
    const envConfigured = !!(process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL);
    if (!envConfigured) {
      return NextResponse.json({ data: [], envConfigured }, { status: 200 });
    }
    if (!prisma) return NextResponse.json({ data: [], envConfigured }, { status: 200 });
    let c = 0;
    try {
      c = await prisma.token.count();
    } catch {
      return NextResponse.json({ data: [], envConfigured }, { status: 200 });
    }
    if (c === 0) {
      const initialAddresses = [
        '0x52b5fb4b0f6572b8c44d0251cc224513ac5eb7e7',
        '0xcf3232b85b43bca90e51d38cc06cc8bb8c8a3e36',
        '0x0e63b9c287e32a05e6b9ab8ee8df88a2760225a9',
        '0x0e4f6209ed984b21edea43ace6e09559ed051d48',
        '0x81a7da4074b8e0ed51bea40f9dcbdf4d9d4832b4',
        '0xe6df05ce8c8301223373cf5b969afcb1498c5528',
      ];
      await prisma.token.createMany({ data: initialAddresses.map(addr => ({ address: addr, chain_id: null })), skipDuplicates: true });
    }

    let addresses: string[] = [];
    try {
      const rows = await prisma.token.findMany({ select: { address: true }, orderBy: { id: 'desc' } });
      addresses = rows.map((r: { address: string }) => r.address);
    } catch {
      return NextResponse.json({ data: [], envConfigured }, { status: 200 });
    }
    if (addresses.length === 0) {
      return NextResponse.json({ data: [], envConfigured }, { status: 200 });
    }
    const data = await fetchMultipleTickers(addresses);
    return NextResponse.json({ data, envConfigured }, { status: 200 });
  } catch (e: unknown) {
    console.error('GET /api/market/tickers error:', e);
    const envConfigured = !!(process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL);
    return NextResponse.json({ data: [], envConfigured, error: '获取行情失败', detail: (e as Error)?.message }, { status: 200 });
  }
}