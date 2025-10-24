/* eslint-disable no-console */
import { prisma, disconnect } from './db';
import { seedUsers } from './01_users';
import { seedBrands, seedCategories } from './02_brands_categories';
import { seedSizes } from './03_sizes';
import { seedProducts } from './04_products';
import { seedVariantsManualFull } from './05_variants';
import { seedVouchers } from './06_vouchers';
import { seedSiteContents } from './07_site_contents';
import { seedVariantAssets } from './08_assets';
import { seedOrdersComplete } from './09_orders';

async function main() {
  console.log('🌱 Starting seed...');
  await seedUsers(prisma);
  await seedBrands(prisma);
  await seedCategories(prisma);
  await seedSizes(prisma);
  await seedProducts(prisma);
  await seedVariantsManualFull(prisma);
  await seedVouchers(prisma);
  await seedSiteContents(prisma);
  await seedVariantAssets(prisma);
  await seedOrdersComplete(prisma);
  console.log('✅ Seed completed!');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    // Đặt exitCode để vẫn chạy finally (disconnect)
    process.exitCode = 1;
  })
  .finally(() => {
    // Không trả Promise trong callback finally
    void disconnect();
  });
