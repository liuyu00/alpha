import { NextResponse } from 'next/server';
import {prisma} from '@/lib/db';

export async function GET() {
  try {
    const envConfigured = !!(process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL);
    if (!envConfigured) {
      return NextResponse.json({ tokens: [], envConfigured }, { status: 200 });
    }
    if (!prisma) return NextResponse.json({ tokens: [], envConfigured }, { status: 200 });
    // let c = 0;
    // try {
    //   c = await prisma.token.count();
    // } catch {
    //   return NextResponse.json({ tokens: [], envConfigured }, { status: 200 });
    // }
    // if (c === 0) {
    //   const initialAddresses = [
    //     '0x52b5fb4b0f6572b8c44d0251cc224513ac5eb7e7',
    //     '0xcf3232b85b43bca90e51d38cc06cc8bb8c8a3e36',
    //     '0x0e63b9c287e32a05e6b9ab8ee8df88a2760225a9',
    //     '0x0e4f6209ed984b21edea43ace6e09559ed051d48',
    //     '0x81a7da4074b8e0ed51bea40f9dcbdf4d9d4832b4',
    //     '0xe6df05ce8c8301223373cf5b969afcb1498c5528',
    //   ];
    //   await prisma.token.createMany({ data: initialAddresses.map(addr => ({ address: addr, chain_id: null })), skipDuplicates: true });
    // }
    console.log('GET /api/tokens 开始查询 tokens 表...');
    try {
      const rows = await prisma.token.findMany({ select: { address: true, chain_id: true }, orderBy: { id: 'desc' } });
      return NextResponse.json({ tokens: rows, envConfigured }, { status: 200 });
    } catch {
      return NextResponse.json({ tokens: [], envConfigured }, { status: 200 });
    }
  } catch (e: any) {
    console.error('GET /api/tokens error:', e);
    const envConfigured = !!(process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL);
    return NextResponse.json({ tokens: [], envConfigured, error: '数据库读取失败', detail: e?.message }, { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL)) {
      return NextResponse.json({ ok: true, skipped: true }, { status: 201 });
    }
    if (!prisma) return NextResponse.json({ ok: true, skipped: true }, { status: 201 });
    const body = await req.json();
    const address: string = (body?.address || '').trim();
    const chainId: string | null = body?.chainId ?? null;

    if (!address) {
      return NextResponse.json({ error: 'address 必填' }, { status: 400 });
    }

    try {
      await prisma.token.createMany({ data: [{ address, chain_id: chainId }], skipDuplicates: true });
      return NextResponse.json({ ok: true }, { status: 201 });
    } catch {
      return NextResponse.json({ ok: true, skipped: true }, { status: 201 });
    }
  } catch (e: any) {
    console.error('POST /api/tokens error:', e);
    return NextResponse.json({ ok: true, skipped: true, error: '数据库写入失败', detail: e?.message }, { status: 201 });
  }
}