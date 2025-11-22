import { NextResponse } from 'next/server';
import { fetchTickerPrice } from '@/services/binanceService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const address: string = (body?.address || '').trim();
    if (!address) {
      return NextResponse.json({ error: 'address 必填' }, { status: 400 });
    }
    const data = await fetchTickerPrice(address);
    return NextResponse.json({ data }, { status: 200 });
  } catch (e: any) {
    console.error('POST /api/market/ticker error:', e);
    return NextResponse.json({ error: '获取详情失败', detail: e?.message }, { status: 500 });
  }
}