// seed/07.inventory-snapshots.ts
import { PrismaClient, Prisma } from '@prisma/client';

/**
 * Seed Inventory Snapshots
 * Tạo snapshot tồn kho CHÍNH XÁC dựa trên:
 * 1. Quantity ban đầu từ seed variants
 * 2. Các transactions đã tạo (nếu có)
 *
 * Logic: Mỗi ngày snapshot = quantity đầu ngày đó
 */

// Type-safe snapshot data
type SnapshotInput = Prisma.inventory_snapshotsCreateManyInput;

export async function seedInventorySnapshots(prisma: PrismaClient) {
  console.log('📊 Seeding Inventory Snapshots...');

  // 1. Lấy tất cả variants với quantity hiện tại
  const variants = await prisma.product_variants.findMany({
    select: {
      variant_id: true,
      quantity: true,
      sku: true,
      created_at: true,
    },
    orderBy: {
      variant_id: 'asc',
    },
  });

  console.log(`📦 Found ${variants.length} variants`);

  // 2. Lấy tất cả transactions để tính toán chính xác
  const transactions = await prisma.inventory_transactions.findMany({
    select: {
      variant_id: true,
      change_quantity: true,
      created_at: true,
      reason: true,
    },
    orderBy: {
      created_at: 'asc',
    },
  });

  console.log(`📝 Found ${transactions.length} transactions`);

  // 3. Tạo snapshots cho 30 ngày gần đây
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const snapshotsData: SnapshotInput[] = [];

  // Xử lý từng variant
  for (const variant of variants) {
    // Lấy các transactions của variant này
    const variantTransactions = transactions.filter((t) => t.variant_id === variant.variant_id);

    // Tính quantity hiện tại (từ DB)
    const currentQuantity = variant.quantity;

    // Tạo snapshot cho 30 ngày
    for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
      const snapshotDate = new Date(today);
      snapshotDate.setDate(today.getDate() - daysAgo);
      snapshotDate.setHours(0, 0, 0, 0);

      let quantityAtDate: number;

      if (daysAgo === 0) {
        // Hôm nay = quantity hiện tại
        quantityAtDate = currentQuantity;
      } else {
        // Tính ngược lại quantity vào ngày đó
        // Bằng cách trừ đi các transactions XẢY RA SAU ngày đó
        quantityAtDate = currentQuantity;

        // Lọc transactions sau ngày snapshot
        const futureTransactions = variantTransactions.filter((t) => {
          const transDate = new Date(t.created_at);
          transDate.setHours(0, 0, 0, 0);
          return transDate > snapshotDate;
        });

        // Trừ ngược các transactions này
        futureTransactions.forEach((t) => {
          quantityAtDate -= t.change_quantity;
        });

        // Nếu không có transactions, tạo biến động tự nhiên
        if (variantTransactions.length === 0) {
          // Pattern: càng xa càng nhiều hàng
          const fluctuation = Math.floor(Math.random() * Math.min(daysAgo * 2, 20));
          quantityAtDate = currentQuantity + fluctuation;
        }
      }

      // Đảm bảo không âm
      quantityAtDate = Math.max(0, quantityAtDate);

      snapshotsData.push({
        variant_id: variant.variant_id,
        quantity: quantityAtDate,
        snapshot_date: snapshotDate,
        created_at: snapshotDate,
      });
    }
  }

  console.log(`💾 Preparing to insert ${snapshotsData.length} snapshots...`);

  // 4. Batch insert với type-safe
  const batchSize = 500;
  let inserted = 0;

  for (let i = 0; i < snapshotsData.length; i += batchSize) {
    const batch = snapshotsData.slice(i, i + batchSize);

    await prisma.inventory_snapshots.createMany({
      data: batch,
      skipDuplicates: true,
    });

    inserted += batch.length;
    console.log(`  ✅ Inserted ${inserted}/${snapshotsData.length} snapshots`);
  }

  // 5. Thống kê chi tiết
  console.log('\n📈 Snapshot Statistics:');

  // Thống kê theo ngày
  const dailyStats = await prisma.inventory_snapshots.groupBy({
    by: ['snapshot_date'],
    _count: { snapshot_id: true },
    _sum: { quantity: true },
    orderBy: { snapshot_date: 'desc' },
    take: 7,
  });

  console.log('\n📅 Last 7 days:');
  dailyStats.forEach((stat) => {
    const date = stat.snapshot_date.toISOString().split('T')[0];
    const totalQty = stat._sum.quantity || 0;
    const avgQty = Math.round(totalQty / (stat._count.snapshot_id || 1));
    console.log(
      `  ${date}: ${stat._count.snapshot_id} variants, Total: ${totalQty}, Avg: ${avgQty}`,
    );
  });

  // Sample data từ một vài variants
  const sampleSnapshots = await prisma.inventory_snapshots.findMany({
    where: {
      variant_id: { in: [1, 2, 3] },
    },
    include: {
      product_variants: {
        select: { sku: true },
      },
    },
    orderBy: [{ variant_id: 'asc' }, { snapshot_date: 'desc' }],
    take: 6,
  });

  console.log('\n📊 Sample Snapshots:');
  sampleSnapshots.forEach((s) => {
    const date = s.snapshot_date.toISOString().split('T')[0];
    console.log(`  ${s.product_variants.sku} @ ${date}: ${s.quantity} units`);
  });

  console.log('\n🎉 Inventory Snapshots seed completed!');
}

export default seedInventorySnapshots;
