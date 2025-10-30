// import * as dotenv from 'dotenv';
// dotenv.config({ path: '.env' });
// import { Client } from 'pg';

// async function main() {
//   const client = new Client({
//     host: process.env.DB_HOST,
//     port: Number(process.env.DB_PORT || 5432),
//     user: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     database: process.env.DB_NAME,
//   });
//   await client.connect();

//   // đảm bảo schema
//   await client.query(`CREATE SCHEMA IF NOT EXISTS clothing_ecom;`);

//   // vouchers.title
//   await client.query(`
//     ALTER TABLE "clothing_ecom"."vouchers"
//     ADD COLUMN IF NOT EXISTS "title" VARCHAR(100) DEFAULT 'Voucher';
//   `);
//   await client.query(`
//     UPDATE "clothing_ecom"."vouchers"
//     SET "title" = 'Voucher'
//     WHERE "title" IS NULL;
//   `);
//   await client.query(`
//     ALTER TABLE "clothing_ecom"."vouchers"
//       ALTER COLUMN "title" SET NOT NULL,
//       ALTER COLUMN "title" SET DEFAULT 'Voucher';
//   `);

//   // addresses.consignee_name
//   await client.query(`
//     ALTER TABLE "clothing_ecom"."addresses"
//     ADD COLUMN IF NOT EXISTS "consignee_name" VARCHAR(100) DEFAULT 'Unknown';
//   `);
//   await client.query(`
//     UPDATE "clothing_ecom"."addresses"
//     SET "consignee_name" = 'Unknown'
//     WHERE "consignee_name" IS NULL;
//   `);
//   await client.query(`
//     ALTER TABLE "clothing_ecom"."addresses"
//       ALTER COLUMN "consignee_name" SET NOT NULL,
//       ALTER COLUMN "consignee_name" SET DEFAULT 'Unknown';
//   `);

//   await client.end();
//   console.log('✅ prestart DB fix done.');
// }

// main().catch((e) => {
//   console.error('❌ prestart DB fix failed:', e);
//   process.exit(1);
// });
