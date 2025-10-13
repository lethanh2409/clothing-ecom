/*
  Warnings:

  - You are about to drop the `_product_variantsTosizes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "clothing_ecom"."_product_variantsTosizes" DROP CONSTRAINT "_product_variantsTosizes_A_fkey";

-- DropForeignKey
ALTER TABLE "clothing_ecom"."_product_variantsTosizes" DROP CONSTRAINT "_product_variantsTosizes_B_fkey";

-- AlterTable
ALTER TABLE "clothing_ecom"."product_variants" ADD COLUMN     "size_id" INTEGER;

-- DropTable
DROP TABLE "clothing_ecom"."_product_variantsTosizes";

-- AddForeignKey
ALTER TABLE "clothing_ecom"."product_variants" ADD CONSTRAINT "product_variants_size_id_fkey" FOREIGN KEY ("size_id") REFERENCES "clothing_ecom"."sizes"("size_id") ON DELETE SET NULL ON UPDATE CASCADE;
