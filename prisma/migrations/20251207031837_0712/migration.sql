-- AlterTable
ALTER TABLE "clothing_ecom"."inventory_snapshots" ADD COLUMN     "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP;
