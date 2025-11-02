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
  console.log('🌱 Starting seed...\n');

  console.log('=== Step 1: Users ===');
  await seedUsers(prisma);

  console.log('\n=== Step 2: Brands & Categories ===');
  await seedBrands(prisma);
  await seedCategories(prisma);

  console.log('\n=== Step 3: Sizes ===');
  await seedSizes(prisma);

  console.log('\n=== Step 4: Products ===');
  await seedProducts(prisma);

  console.log('\n=== Step 5: Variants ===');
  await seedVariantsManualFull(prisma);

  console.log('\n=== Step 6: Vouchers ===');
  await seedVouchers(prisma);

  console.log('\n=== Step 7: Site Contents ===');
  await seedSiteContents(prisma);

  console.log('\n=== Step 8: Variant Assets ===');
  await seedVariantAssets(prisma);

  console.log('\n=== Step 9: Orders ===');
  await seedOrdersComplete(prisma);

  console.log('\n✅ Seed completed successfully!');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(() => {
    void disconnect();
  });
