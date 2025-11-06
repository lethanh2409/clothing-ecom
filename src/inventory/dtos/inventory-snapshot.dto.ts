// src/inventory/dtos/inventory-snapshot.dto.ts
export interface InventorySnapshotDto {
  snapshot_id: number;
  variant_id: number;
  quantity: number;
  snapshot_date: Date;
  created_at: Date;
}

export interface CreateSnapshotResponseDto {
  date: string;
  snapshotCount: number;
  totalQuantity: number;
}

export interface CleanSnapshotsResponseDto {
  deletedCount: number;
  cutoffDate: string;
}

export interface InventoryAtDateDto {
  variant_id: number;
  sku?: string;
  product_name?: string;
  date: string;
  quantity: number;
  source: string;
}

export interface MonthlyInventoryDto {
  variant_id: number;
  sku?: string;
  product_name?: string;
  month: number;
  year: number;
  data: Array<{ date: string; quantity: number }>;
}

export interface BulkInventoryAtDateDto {
  variant_id: number;
  sku?: string;
  product_name?: string;
  date: string;
  quantity: number;
}

export interface ChangeReportDto {
  period: { from: string; to: string };
  summary: { totalTransactions: number; variantsAffected: number };
  variants: Array<{
    variant_id: number;
    sku: string;
    product_name: string;
    total_in: number;
    total_out: number;
    net_change: number;
    transaction_count: number;
  }>;
}

export interface VariantTransactionsDto {
  variant: {
    variant_id: number;
    sku?: string;
    product_name?: string;
    current_quantity?: number;
  };
  transactions: Array<{
    inventory_id: number;
    change_quantity: number;
    reason: string | null;
    order_id: number | null;
    order_status?: string;
    customer_name?: string;
    created_at: string;
  }>;
}

export interface LowStockVariantsDto {
  threshold: number;
  count: number;
  variants: Array<{
    variant_id: number;
    sku: string;
    product_name?: string;
    brand?: string;
    category?: string;
    quantity: number;
    status: string;
  }>;
}

export interface OutOfStockVariantsDto {
  count: number;
  variants: Array<{
    variant_id: number;
    sku: string;
    product_name?: string;
    brand?: string;
  }>;
}

export interface AdjustStockResponseDto {
  variant_id: number;
  sku: string;
  old_quantity: number;
  change: number;
  new_quantity: number;
  reason: string;
  transaction_id: number;
}

export interface BulkStockAdjustDto {
  variantId: number;
  quantity: number;
  reason?: string;
}

export interface BulkStockAdjustResponseDto {
  total: number;
  successful: number;
  failed: number;
  results: {
    successful: AdjustStockResponseDto[];
    failed: Array<{ variantId: number; error: string }>;
  };
}

export interface VariantChangeItem {
  variant_id: number;
  sku: string;
  product_name: string;
  total_in: number;
  total_out: number;
  net_change: number;
  transaction_count: number;
}

export interface ChangeReportDto {
  period: { from: string; to: string };
  summary: { totalTransactions: number; variantsAffected: number };
  variants: VariantChangeItem[]; // 👈 Dùng interface
}
