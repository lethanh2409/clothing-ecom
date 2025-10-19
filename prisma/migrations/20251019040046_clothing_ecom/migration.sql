/*
  Warnings:

  - You are about to drop the column `warehouse_id` on the `inventory_transactions` table. All the data in the column will be lost.
  - You are about to alter the column `cost_price` on the `product_variants` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `base_price` on the `product_variants` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - Made the column `province` on table `addresses` required. This step will fail if there are existing NULL values in that column.
  - Made the column `district` on table `addresses` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ward` on table `addresses` required. This step will fail if there are existing NULL values in that column.
  - Made the column `street` on table `addresses` required. This step will fail if there are existing NULL values in that column.
  - Made the column `house_num` on table `addresses` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "clothing_ecom"."addresses" DROP CONSTRAINT "addresses_customer_id_fkey";

-- AlterTable
ALTER TABLE "clothing_ecom"."addresses" ALTER COLUMN "province" SET NOT NULL,
ALTER COLUMN "district" SET NOT NULL,
ALTER COLUMN "ward" SET NOT NULL,
ALTER COLUMN "street" SET NOT NULL,
ALTER COLUMN "street" SET DEFAULT '',
ALTER COLUMN "house_num" SET NOT NULL,
ALTER COLUMN "house_num" SET DEFAULT '';

-- AlterTable
ALTER TABLE "clothing_ecom"."inventory_transactions" DROP COLUMN "warehouse_id";

-- AlterTable
ALTER TABLE "clothing_ecom"."product_variants" ALTER COLUMN "cost_price" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "base_price" SET DATA TYPE DECIMAL(12,2);

-- CreateIndex
CREATE INDEX "addresses_customer_id_idx" ON "clothing_ecom"."addresses"("customer_id");

-- AddForeignKey
ALTER TABLE "clothing_ecom"."addresses" ADD CONSTRAINT "addresses_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "clothing_ecom"."customers"("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE;
