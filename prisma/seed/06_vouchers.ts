import type { PrismaClient } from '@prisma/client';

// ---- DATASET ----
const vouchersData = [
  {
    title: 'Giam10',
    description: 'Giảm 10% đơn từ 300k',
    discount_type: 'percent',
    discount_value: 10,
    min_order_value: 300000,
    max_discount: 50000,
    quantity: 100,
  },
  {
    title: 'Tru50000',
    description: 'Giảm 50k đơn từ 400k',
    discount_type: 'fixed',
    discount_value: 50000,
    min_order_value: 400000,
    max_discount: 50000,
    quantity: 50,
  },
];

// ---- SEED ----
export async function seedVouchers(prisma: PrismaClient) {
  console.log('🎟️  Seeding vouchers…');
  await prisma.vouchers.createMany({ data: vouchersData, skipDuplicates: true }); // cần unique vouchers.title (hoặc code)
}
