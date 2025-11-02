export interface VoucherResponseDto {
  voucher_id: number;
  title: string;
  description: string | null;
  discount_type: string;
  discount_value: number | null;
  min_order_value: number | null;
  max_discount: number | null;
  quantity: number;
  used_count: number;
  per_customer_limit: number | null;
  start_date: string | null;
  end_date: string | null;
  status: boolean;
  created_at: string;
  updated_at: string;
}
