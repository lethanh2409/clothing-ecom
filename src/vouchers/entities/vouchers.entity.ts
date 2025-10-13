// @Entity('vouchers')
export class Voucher {
  voucher_id: number;

  title: string;

  description?: string;

  discount_type: 'percent' | 'fixed';

  discount_value: number;

  min_order_value?: number;

  max_discount?: number;

  quantity: number;

  used_count: number;

  per_customer_limit: number;

  start_date?: Date;

  end_date?: Date;

  status: boolean;

  created_at: Date;

  updated_at: Date;
}
