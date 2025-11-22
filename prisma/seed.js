// 使用动态 import，避免 CommonJS require 被禁用的诊断
(async () => {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  async function ensureSchema() {
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS tokens (
          id SERIAL PRIMARY KEY,
          address TEXT UNIQUE NOT NULL,
          chain_id TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
    } catch (e) {
      console.warn('确保 tokens 表失败:', e?.message || e);
    }
  }

  async function main() {
    console.log('Prisma seed: 开始初始化 tokens 表...');
    await ensureSchema();

  const initialAddresses = [
    '0x52b5fb4b0f6572b8c44d0251cc224513ac5eb7e7',
    '0xcf3232b85b43bca90e51d38cc06cc8bb8c8a3e36',
    '0x0e63b9c287e32a05e6b9ab8ee8df88a2760225a9',
    '0x0e4f6209ed984b21edea43ace6e09559ed051d48',
    '0x81a7da4074b8e0ed51bea40f9dcbdf4d9d4832b4',
    '0xe6df05ce8c8301223373cf5b969afcb1498c5528',
  ];

  let count = 0;
  try {
    count = await prisma.token.count();
  } catch (e) {
    console.warn('无法读取 tokens 计数，可能权限不足或未连接:', e?.message || e);
  }

  if (count === 0) {
    try {
      const res = await prisma.token.createMany({
        data: initialAddresses.map((addr) => ({ address: addr, chain_id: null })),
        skipDuplicates: true,
      });
      console.log(`插入默认地址完成，新增 ${res.count} 条`);
    } catch (e) {
      console.warn('createMany 失败，尝试逐条插入（可能仍受限）');
      let inserted = 0;
      for (const addr of initialAddresses) {
        try {
          await prisma.$executeRaw`INSERT INTO tokens (address, chain_id) VALUES (${addr}, ${null}) ON CONFLICT (address) DO NOTHING;`;
          inserted += 1;
        } catch (err) {}
      }
      console.log(`逐条插入完成，新增 ${inserted} 条`);
    }
  } else {
    console.log(`tokens 表已有 ${count} 条记录，跳过默认插入`);
  }
  }

  main()
    .catch((e) => {
      console.error('Prisma seed 失败:', e);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
      console.log('Prisma seed: 结束');
    });
})();