// seed/09_orders_extended.ts
import type { PrismaClient } from '@prisma/client';

// ---- DATASET ORDERS ----
const ordersData = [
  // ==================== 2024 - THÁNG 1 ====================
  {
    order_id: 1,
    customer_id: 1,
    address_id: 1,
    subtotal_price: 2700000,
    discount_price: 0,
    total_price: 2730000, // 2700000 + 30000
    shipping_fee: 30000,
    note: 'Giao giờ hành chính',
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-01-05T10:30:00'),
  },
  {
    order_id: 2,
    customer_id: 2,
    address_id: 3,
    subtotal_price: 1599000,
    discount_price: 0,
    total_price: 1624000, // 1599000 + 25000
    shipping_fee: 25000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-01-08T14:20:00'),
  },
  {
    order_id: 3,
    customer_id: 1,
    address_id: 2,
    subtotal_price: 3990000,
    discount_price: 0,
    total_price: 3990000, // 3990000 + 0
    shipping_fee: 0,
    note: 'Freeship',
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-01-12T09:15:00'),
  },
  {
    order_id: 4,
    customer_id: 2,
    address_id: 4,
    subtotal_price: 1798000,
    discount_price: 0,
    total_price: 1828000, // 1798000 + 30000
    shipping_fee: 30000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-01-18T16:45:00'),
  },
  {
    order_id: 5,
    customer_id: 1,
    address_id: 1,
    subtotal_price: 2499000,
    discount_price: 0,
    total_price: 2524000, // 2499000 + 25000
    shipping_fee: 25000,
    note: 'Gọi trước 30 phút',
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-01-25T11:00:00'),
  },

  // ==================== 2024 - THÁNG 2 ====================
  {
    order_id: 6,
    customer_id: 2,
    address_id: 3,
    subtotal_price: 3199000,
    discount_price: 0,
    total_price: 3229000, // 3199000 + 30000
    shipping_fee: 30000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-02-03T10:30:00'),
  },
  {
    order_id: 7,
    customer_id: 1,
    address_id: 1,
    subtotal_price: 1899000,
    discount_price: 0,
    total_price: 1924000, // 1899000 + 25000
    shipping_fee: 25000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-02-10T15:20:00'),
  },
  {
    order_id: 8,
    customer_id: 2,
    address_id: 3,
    subtotal_price: 4599000,
    discount_price: 0,
    total_price: 4599000, // 4599000 + 0
    shipping_fee: 0,
    note: 'VIP - Freeship',
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-02-14T09:00:00'),
  },
  {
    order_id: 9,
    customer_id: 1,
    address_id: 2,
    subtotal_price: 998000,
    discount_price: 0,
    total_price: 1028000, // 998000 + 30000
    shipping_fee: 30000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-02-20T14:30:00'),
  },

  // ==================== 2024 - THÁNG 3 ====================
  {
    order_id: 10,
    customer_id: 1,
    address_id: 1,
    subtotal_price: 2199000,
    discount_price: 0,
    total_price: 2224000, // 2199000 + 25000
    shipping_fee: 25000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-03-05T10:00:00'),
  },
  {
    order_id: 11,
    customer_id: 2,
    address_id: 4,
    subtotal_price: 3499000,
    discount_price: 0,
    total_price: 3529000, // 3499000 + 30000
    shipping_fee: 30000,
    note: 'Không giao cuối tuần',
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-03-12T13:15:00'),
  },
  {
    order_id: 12,
    customer_id: 1,
    address_id: 1,
    subtotal_price: 1699000,
    discount_price: 0,
    total_price: 1724000, // 1699000 + 25000
    shipping_fee: 25000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-03-18T16:00:00'),
  },
  {
    order_id: 13,
    customer_id: 2,
    address_id: 3,
    subtotal_price: 2899000,
    discount_price: 0,
    total_price: 2929000, // 2899000 + 30000
    shipping_fee: 30000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-03-25T11:30:00'),
  },
  {
    order_id: 14,
    customer_id: 1,
    address_id: 2,
    subtotal_price: 5199000,
    discount_price: 0,
    total_price: 5199000, // 5199000 + 0
    shipping_fee: 0,
    note: 'Đơn lớn - Freeship',
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-03-28T09:45:00'),
  },

  // ==================== 2024 - THÁNG 4 ====================
  {
    order_id: 15,
    customer_id: 2,
    address_id: 3,
    subtotal_price: 1899000,
    discount_price: 0,
    total_price: 1924000, // 1899000 + 25000
    shipping_fee: 25000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-04-03T14:20:00'),
  },
  {
    order_id: 16,
    customer_id: 1,
    address_id: 1,
    subtotal_price: 3299000,
    discount_price: 0,
    total_price: 3329000, // 3299000 + 30000
    shipping_fee: 30000,
    note: 'Giao buổi sáng',
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-04-10T10:00:00'),
  },
  {
    order_id: 17,
    customer_id: 2,
    address_id: 4,
    subtotal_price: 2599000,
    discount_price: 0,
    total_price: 2624000, // 2599000 + 25000
    shipping_fee: 25000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-04-15T15:30:00'),
  },
  {
    order_id: 18,
    customer_id: 1,
    address_id: 1,
    subtotal_price: 1399000,
    discount_price: 0,
    total_price: 1429000, // 1399000 + 30000
    shipping_fee: 30000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-04-22T11:45:00'),
  },

  // ==================== 2024 - THÁNG 5 ====================
  {
    order_id: 19,
    customer_id: 1,
    address_id: 2,
    subtotal_price: 4199000,
    discount_price: 0,
    total_price: 4199000, // 4199000 + 0
    shipping_fee: 0,
    note: 'Freeship',
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-05-05T09:00:00'),
  },
  {
    order_id: 20,
    customer_id: 2,
    address_id: 3,
    subtotal_price: 2899000,
    discount_price: 0,
    total_price: 2929000, // 2899000 + 30000
    shipping_fee: 30000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-05-12T13:20:00'),
  },
  {
    order_id: 21,
    customer_id: 1,
    address_id: 1,
    subtotal_price: 1799000,
    discount_price: 0,
    total_price: 1824000, // 1799000 + 25000
    shipping_fee: 25000,
    note: 'Giao giờ hành chính',
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-05-18T10:30:00'),
  },
  {
    order_id: 22,
    customer_id: 2,
    address_id: 4,
    subtotal_price: 3599000,
    discount_price: 0,
    total_price: 3629000, // 3599000 + 30000
    shipping_fee: 30000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-05-25T14:00:00'),
  },

  // ==================== 2024 - THÁNG 6 ====================
  {
    order_id: 23,
    customer_id: 1,
    address_id: 1,
    subtotal_price: 2399000,
    discount_price: 0,
    total_price: 2424000, // 2399000 + 25000
    shipping_fee: 25000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-06-03T11:00:00'),
  },
  {
    order_id: 24,
    customer_id: 2,
    address_id: 3,
    subtotal_price: 5499000,
    discount_price: 0,
    total_price: 5499000, // 5499000 + 0
    shipping_fee: 0,
    note: 'VIP - Freeship',
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-06-10T09:30:00'),
  },
  {
    order_id: 25,
    customer_id: 1,
    address_id: 2,
    subtotal_price: 1599000,
    discount_price: 0,
    total_price: 1629000, // 1599000 + 30000
    shipping_fee: 30000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-06-17T15:20:00'),
  },
  {
    order_id: 26,
    customer_id: 2,
    address_id: 3,
    subtotal_price: 2999000,
    discount_price: 0,
    total_price: 3024000, // 2999000 + 25000
    shipping_fee: 25000,
    note: 'Gọi trước khi giao',
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-06-24T10:45:00'),
  },

  // ==================== 2024 - THÁNG 7 ====================
  {
    order_id: 27,
    customer_id: 1,
    address_id: 1,
    subtotal_price: 3799000,
    discount_price: 0,
    total_price: 3829000, // 3799000 + 30000
    shipping_fee: 30000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-07-05T13:00:00'),
  },
  {
    order_id: 28,
    customer_id: 2,
    address_id: 4,
    subtotal_price: 1899000,
    discount_price: 0,
    total_price: 1924000, // 1899000 + 25000
    shipping_fee: 25000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-07-12T16:30:00'),
  },
  {
    order_id: 29,
    customer_id: 1,
    address_id: 1,
    subtotal_price: 4599000,
    discount_price: 0,
    total_price: 4599000, // 4599000 + 0
    shipping_fee: 0,
    note: 'Đơn lớn',
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-07-19T10:00:00'),
  },
  {
    order_id: 30,
    customer_id: 2,
    address_id: 3,
    subtotal_price: 2199000,
    discount_price: 0,
    total_price: 2229000, // 2199000 + 30000
    shipping_fee: 30000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-07-26T14:15:00'),
  },

  // ==================== 2024 - THÁNG 8 ====================
  {
    order_id: 31,
    customer_id: 1,
    address_id: 2,
    subtotal_price: 2899000,
    discount_price: 0,
    total_price: 2924000, // 2899000 + 25000
    shipping_fee: 25000,
    note: 'Giao buổi chiều',
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-08-02T11:30:00'),
  },
  {
    order_id: 32,
    customer_id: 2,
    address_id: 3,
    subtotal_price: 3999000,
    discount_price: 0,
    total_price: 4029000, // 3999000 + 30000
    shipping_fee: 30000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-08-09T09:45:00'),
  },
  {
    order_id: 33,
    customer_id: 1,
    address_id: 1,
    subtotal_price: 1699000,
    discount_price: 0,
    total_price: 1724000, // 1699000 + 25000
    shipping_fee: 25000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-08-16T15:00:00'),
  },
  {
    order_id: 34,
    customer_id: 2,
    address_id: 4,
    subtotal_price: 5299000,
    discount_price: 0,
    total_price: 5299000, // 5299000 + 0
    shipping_fee: 0,
    note: 'VIP',
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-08-23T10:20:00'),
  },

  // ==================== 2024 - THÁNG 9 ====================
  {
    order_id: 35,
    customer_id: 1,
    address_id: 1,
    subtotal_price: 2599000,
    discount_price: 0,
    total_price: 2629000, // 2599000 + 30000
    shipping_fee: 30000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-09-04T13:30:00'),
  },
  {
    order_id: 36,
    customer_id: 2,
    address_id: 3,
    subtotal_price: 1899000,
    discount_price: 0,
    total_price: 1924000, // 1899000 + 25000
    shipping_fee: 25000,
    note: 'Giao nhanh',
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-09-11T10:00:00'),
  },
  {
    order_id: 37,
    customer_id: 1,
    address_id: 2,
    subtotal_price: 4299000,
    discount_price: 0,
    total_price: 4299000, // 4299000 + 0
    shipping_fee: 0,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-09-18T14:45:00'),
  },
  {
    order_id: 38,
    customer_id: 2,
    address_id: 3,
    subtotal_price: 2999000,
    discount_price: 0,
    total_price: 3029000, // 2999000 + 30000
    shipping_fee: 30000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-09-25T11:15:00'),
  },

  // ==================== 2024 - THÁNG 10 ====================
  {
    order_id: 39,
    customer_id: 1,
    address_id: 1,
    subtotal_price: 3599000,
    discount_price: 0,
    total_price: 3624000, // 3599000 + 25000
    shipping_fee: 25000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-10-03T09:30:00'),
  },
  {
    order_id: 40,
    customer_id: 2,
    address_id: 4,
    subtotal_price: 1799000,
    discount_price: 0,
    total_price: 1829000, // 1799000 + 30000
    shipping_fee: 30000,
    note: 'Không giao tối',
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-10-10T15:20:00'),
  },
  {
    order_id: 41,
    customer_id: 1,
    address_id: 1,
    subtotal_price: 4899000,
    discount_price: 0,
    total_price: 4899000, // 4899000 + 0
    shipping_fee: 0,
    note: 'Freeship',
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-10-17T10:45:00'),
  },
  {
    order_id: 42,
    customer_id: 2,
    address_id: 3,
    subtotal_price: 2399000,
    discount_price: 0,
    total_price: 2424000, // 2399000 + 25000
    shipping_fee: 25000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-10-24T14:00:00'),
  },

  // ==================== 2024 - THÁNG 11 ====================
  {
    order_id: 43,
    customer_id: 1,
    address_id: 2,
    subtotal_price: 3199000,
    discount_price: 0,
    total_price: 3229000, // 3199000 + 30000
    shipping_fee: 30000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-11-05T11:00:00'),
  },
  {
    order_id: 44,
    customer_id: 2,
    address_id: 3,
    subtotal_price: 5699000,
    discount_price: 0,
    total_price: 5699000, // 5699000 + 0
    shipping_fee: 0,
    note: 'Black Friday',
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-11-29T09:00:00'),
  },

  // ==================== 2024 - THÁNG 12 ====================
  {
    order_id: 45,
    customer_id: 1,
    address_id: 1,
    subtotal_price: 2899000,
    discount_price: 0,
    total_price: 2924000, // 2899000 + 25000
    shipping_fee: 25000,
    note: 'Quà Giáng Sinh',
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-12-15T10:30:00'),
  },
  {
    order_id: 46,
    customer_id: 2,
    address_id: 4,
    subtotal_price: 4399000,
    discount_price: 0,
    total_price: 4429000, // 4399000 + 30000
    shipping_fee: 30000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2024-12-20T14:15:00'),
  },

  // ==================== 2025 - THÁNG 1 ====================
  {
    order_id: 47,
    customer_id: 1,
    address_id: 1,
    subtotal_price: 2090000,
    discount_price: 0,
    total_price: 2120000, // 2090000 + 30000
    shipping_fee: 30000,
    note: 'Tết Nguyên Đán',
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2025-01-15T10:00:00'),
  },
  {
    order_id: 48,
    customer_id: 2,
    address_id: 3,
    subtotal_price: 3498000,
    discount_price: 0,
    total_price: 3523000, // 3498000 + 25000
    shipping_fee: 25000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2025-01-20T14:00:00'),
  },
  {
    order_id: 49,
    customer_id: 1,
    address_id: 2,
    subtotal_price: 1899000,
    discount_price: 0,
    total_price: 1929000, // 1899000 + 30000
    shipping_fee: 30000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2025-01-25T11:30:00'),
  },

  // ==================== 2025 - THÁNG 2 ====================
  {
    order_id: 50,
    customer_id: 2,
    address_id: 3,
    subtotal_price: 2799000,
    discount_price: 0,
    total_price: 2824000, // 2799000 + 25000
    shipping_fee: 25000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2025-02-05T09:45:00'),
  },
  {
    order_id: 51,
    customer_id: 1,
    address_id: 1,
    subtotal_price: 4599000,
    discount_price: 0,
    total_price: 4599000, // 4599000 + 0
    shipping_fee: 0,
    note: 'VIP',
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2025-02-14T10:00:00'),
  },

  // ==================== 2025 - THÁNG 3 ====================
  {
    order_id: 52,
    customer_id: 1,
    address_id: 1,
    subtotal_price: 3199000,
    discount_price: 0,
    total_price: 3229000, // 3199000 + 30000
    shipping_fee: 30000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2025-03-08T13:00:00'),
  },
  {
    order_id: 53,
    customer_id: 2,
    address_id: 4,
    subtotal_price: 2599000,
    discount_price: 0,
    total_price: 2624000, // 2599000 + 25000
    shipping_fee: 25000,
    note: 'Ngày Phụ Nữ',
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2025-03-08T15:30:00'),
  },

  // ==================== 2025 - THÁNG 4 ====================
  {
    order_id: 54,
    customer_id: 1,
    address_id: 2,
    subtotal_price: 1999000,
    discount_price: 0,
    total_price: 2029000, // 1999000 + 30000
    shipping_fee: 30000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2025-04-10T10:20:00'),
  },
  {
    order_id: 55,
    customer_id: 2,
    address_id: 3,
    subtotal_price: 3899000,
    discount_price: 0,
    total_price: 3924000, // 3899000 + 25000
    shipping_fee: 25000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2025-04-20T14:45:00'),
  },
  // ==================== 2025 - THÁNG 5 ====================
  {
    order_id: 56,
    customer_id: 1,
    address_id: 1,
    subtotal_price: 2999000,
    discount_price: 0,
    total_price: 3029000, // 2999000 + 30000
    shipping_fee: 30000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2025-05-05T11:00:00'),
  },
  {
    order_id: 57,
    customer_id: 2,
    address_id: 3,
    subtotal_price: 4799000,
    discount_price: 0,
    total_price: 4799000, // 4799000 + 0
    shipping_fee: 0,
    note: 'Freeship',
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2025-05-15T09:30:00'),
  },
  // ==================== 2025 - THÁNG 6 ====================
  {
    order_id: 58,
    customer_id: 1,
    address_id: 1,
    subtotal_price: 2399000,
    discount_price: 0,
    total_price: 2424000, // 2399000 + 25000
    shipping_fee: 25000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2025-06-10T13:20:00'),
  },
  {
    order_id: 59,
    customer_id: 2,
    address_id: 4,
    subtotal_price: 3599000,
    discount_price: 0,
    total_price: 3629000, // 3599000 + 30000
    shipping_fee: 30000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2025-06-20T15:00:00'),
  },
  // ==================== 2025 - THÁNG 7 ====================
  {
    order_id: 60,
    customer_id: 1,
    address_id: 2,
    subtotal_price: 1799000,
    discount_price: 0,
    total_price: 1824000, // 1799000 + 25000
    shipping_fee: 25000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2025-07-05T10:00:00'),
  },
  {
    order_id: 61,
    customer_id: 2,
    address_id: 3,
    subtotal_price: 5199000,
    discount_price: 0,
    total_price: 5199000, // 5199000 + 0
    shipping_fee: 0,
    note: 'VIP - Freeship',
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2025-07-15T14:30:00'),
  },
  // ==================== 2025 - THÁNG 8 ====================
  {
    order_id: 62,
    customer_id: 1,
    address_id: 1,
    subtotal_price: 2899000,
    discount_price: 0,
    total_price: 2929000, // 2899000 + 30000
    shipping_fee: 30000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2025-08-05T11:15:00'),
  },
  {
    order_id: 63,
    customer_id: 2,
    address_id: 3,
    subtotal_price: 3999000,
    discount_price: 0,
    total_price: 4024000, // 3999000 + 25000
    shipping_fee: 25000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2025-08-18T09:45:00'),
  },
  // ==================== 2025 - THÁNG 9 ====================
  {
    order_id: 64,
    customer_id: 1,
    address_id: 1,
    subtotal_price: 2199000,
    discount_price: 0,
    total_price: 2224000, // 2199000 + 25000
    shipping_fee: 25000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2025-09-05T13:00:00'),
  },
  {
    order_id: 65,
    customer_id: 2,
    address_id: 4,
    subtotal_price: 4599000,
    discount_price: 0,
    total_price: 4629000, // 4599000 + 30000
    shipping_fee: 30000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2025-09-20T10:30:00'),
  },
  // ==================== 2025 - THÁNG 10 ====================
  {
    order_id: 66,
    customer_id: 1,
    address_id: 1,
    subtotal_price: 3298000,
    discount_price: 0,
    total_price: 3323000, // 3298000 + 25000
    shipping_fee: 25000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2025-10-03T09:00:00'),
  },
  {
    order_id: 67,
    customer_id: 2,
    address_id: 3,
    subtotal_price: 1899000,
    discount_price: 0,
    total_price: 1929000, // 1899000 + 30000
    shipping_fee: 30000,
    note: 'Giao nhanh',
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
    created_at: new Date('2025-10-08T14:15:00'),
  },
  {
    order_id: 68,
    customer_id: 1,
    address_id: 2,
    subtotal_price: 5199000,
    discount_price: 0,
    total_price: 5199000, // 5199000 + 0
    shipping_fee: 0,
    note: 'VIP',
    payment_status: 'paid',
    order_status: 'shipping',
    voucher_id: null,
    created_at: new Date('2025-10-15T10:30:00'),
  },
  {
    order_id: 69,
    customer_id: 2,
    address_id: 3,
    subtotal_price: 2599000,
    discount_price: 0,
    total_price: 2624000, // 2599000 + 25000
    shipping_fee: 25000,
    note: null,
    payment_status: 'paid',
    order_status: 'processing',
    voucher_id: null,
    created_at: new Date('2025-10-20T11:45:00'),
  },
  {
    order_id: 70,
    customer_id: 1,
    address_id: 1,
    subtotal_price: 3899000,
    discount_price: 0,
    total_price: 3929000, // 3899000 + 30000
    shipping_fee: 30000,
    note: 'Gọi trước',
    payment_status: 'pending',
    order_status: 'confirmed',
    voucher_id: null,
    created_at: new Date('2025-10-23T13:00:00'),
  },
  {
    order_id: 71,
    customer_id: 2,
    address_id: 4,
    subtotal_price: 1699000,
    discount_price: 0,
    total_price: 1724000, // 1699000 + 25000
    shipping_fee: 25000,
    note: null,
    payment_status: 'pending',
    order_status: 'pending',
    voucher_id: null,
    created_at: new Date('2025-10-25T15:30:00'),
  },
];

// ---- DATASET ORDER_DETAIL ----
const orderDetailData = [
  // Order 1
  {
    order_detail_id: 1,
    order_id: 1,
    variant_id: 1,
    quantity: 3,
    total_price: 2700000,
  },

  // Order 2
  {
    order_detail_id: 2,
    order_id: 2,
    variant_id: 27,
    quantity: 1,
    total_price: 819000,
  },
  {
    order_detail_id: 3,
    order_id: 2,
    variant_id: 56,
    quantity: 2,
    total_price: 798000,
  },

  // Order 3
  {
    order_detail_id: 4,
    order_id: 3,
    variant_id: 34,
    quantity: 1,
    total_price: 2599000,
  },
  {
    order_detail_id: 5,
    order_id: 3,
    variant_id: 8,
    quantity: 1,
    total_price: 1300000,
  },
  {
    order_detail_id: 6,
    order_id: 3,
    variant_id: 4,
    quantity: 1,
    total_price: 1200000,
  },

  // Order 4
  {
    order_detail_id: 7,
    order_id: 4,
    variant_id: 15,
    quantity: 2,
    total_price: 1580000,
  },
  {
    order_detail_id: 8,
    order_id: 4,
    variant_id: 18,
    quantity: 1,
    total_price: 690000,
  },

  // Order 5
  {
    order_detail_id: 9,
    order_id: 5,
    variant_id: 30,
    quantity: 2,
    total_price: 2598000,
  },

  // Order 6
  {
    order_detail_id: 10,
    order_id: 6,
    variant_id: 37,
    quantity: 1,
    total_price: 2759000,
  },
  {
    order_detail_id: 11,
    order_id: 6,
    variant_id: 41,
    quantity: 1,
    total_price: 999000,
  },
  {
    order_detail_id: 12,
    order_id: 6,
    variant_id: 56,
    quantity: 1,
    total_price: 399000,
  },

  // Order 7
  {
    order_detail_id: 13,
    order_id: 7,
    variant_id: 21,
    quantity: 2,
    total_price: 1980000,
  },

  // Order 8
  {
    order_detail_id: 14,
    order_id: 8,
    variant_id: 53,
    quantity: 2,
    total_price: 4398000,
  },
  {
    order_detail_id: 15,
    order_id: 8,
    variant_id: 18,
    quantity: 1,
    total_price: 690000,
  },

  // Order 9
  {
    order_detail_id: 16,
    order_id: 9,
    variant_id: 41,
    quantity: 1,
    total_price: 999000,
  },

  // Order 10
  {
    order_detail_id: 17,
    order_id: 10,
    variant_id: 53,
    quantity: 1,
    total_price: 2199000,
  },

  // Order 11
  {
    order_detail_id: 18,
    order_id: 11,
    variant_id: 34,
    quantity: 1,
    total_price: 2599000,
  },
  {
    order_detail_id: 19,
    order_id: 11,
    variant_id: 27,
    quantity: 1,
    total_price: 819000,
  },
  {
    order_detail_id: 20,
    order_id: 11,
    variant_id: 4,
    quantity: 1,
    total_price: 1200000,
  },

  // Order 12
  {
    order_detail_id: 21,
    order_id: 12,
    variant_id: 15,
    quantity: 2,
    total_price: 1580000,
  },
  {
    order_detail_id: 22,
    order_id: 12,
    variant_id: 18,
    quantity: 1,
    total_price: 690000,
  },

  // Order 13
  {
    order_detail_id: 23,
    order_id: 13,
    variant_id: 30,
    quantity: 2,
    total_price: 2598000,
  },
  {
    order_detail_id: 24,
    order_id: 13,
    variant_id: 56,
    quantity: 1,
    total_price: 399000,
  },

  // Order 14
  {
    order_detail_id: 25,
    order_id: 14,
    variant_id: 37,
    quantity: 2,
    total_price: 5518000,
  },

  // Order 15
  {
    order_detail_id: 26,
    order_id: 15,
    variant_id: 21,
    quantity: 2,
    total_price: 1980000,
  },

  // Order 16
  {
    order_detail_id: 27,
    order_id: 16,
    variant_id: 34,
    quantity: 1,
    total_price: 2599000,
  },
  {
    order_detail_id: 28,
    order_id: 16,
    variant_id: 27,
    quantity: 1,
    total_price: 819000,
  },
  {
    order_detail_id: 29,
    order_id: 16,
    variant_id: 4,
    quantity: 1,
    total_price: 1200000,
  },

  // Order 17
  {
    order_detail_id: 30,
    order_id: 17,
    variant_id: 53,
    quantity: 1,
    total_price: 2199000,
  },
  {
    order_detail_id: 31,
    order_id: 17,
    variant_id: 56,
    quantity: 1,
    total_price: 399000,
  },

  // Order 18
  {
    order_detail_id: 32,
    order_id: 18,
    variant_id: 50,
    quantity: 1,
    total_price: 1399000,
  },

  // Order 19
  {
    order_detail_id: 33,
    order_id: 19,
    variant_id: 37,
    quantity: 1,
    total_price: 2759000,
  },
  {
    order_detail_id: 34,
    order_id: 19,
    variant_id: 30,
    quantity: 1,
    total_price: 1299000,
  },
  {
    order_detail_id: 35,
    order_id: 19,
    variant_id: 4,
    quantity: 1,
    total_price: 1200000,
  },

  // Order 20
  {
    order_detail_id: 36,
    order_id: 20,
    variant_id: 34,
    quantity: 1,
    total_price: 2599000,
  },
  {
    order_detail_id: 37,
    order_id: 20,
    variant_id: 56,
    quantity: 1,
    total_price: 399000,
  },

  // Order 21
  {
    order_detail_id: 38,
    order_id: 21,
    variant_id: 15,
    quantity: 2,
    total_price: 1580000,
  },
  {
    order_detail_id: 39,
    order_id: 21,
    variant_id: 18,
    quantity: 1,
    total_price: 690000,
  },

  // Order 22
  {
    order_detail_id: 40,
    order_id: 22,
    variant_id: 53,
    quantity: 1,
    total_price: 2199000,
  },
  {
    order_detail_id: 41,
    order_id: 22,
    variant_id: 30,
    quantity: 1,
    total_price: 1299000,
  },
  {
    order_detail_id: 42,
    order_id: 22,
    variant_id: 4,
    quantity: 1,
    total_price: 1200000,
  },

  // Order 23
  {
    order_detail_id: 43,
    order_id: 23,
    variant_id: 37,
    quantity: 1,
    total_price: 2759000,
  },

  // Order 24
  {
    order_detail_id: 44,
    order_id: 24,
    variant_id: 34,
    quantity: 2,
    total_price: 5198000,
  },
  {
    order_detail_id: 45,
    order_id: 24,
    variant_id: 56,
    quantity: 1,
    total_price: 399000,
  },

  // Order 25
  {
    order_detail_id: 46,
    order_id: 25,
    variant_id: 27,
    quantity: 1,
    total_price: 819000,
  },
  {
    order_detail_id: 47,
    order_id: 25,
    variant_id: 56,
    quantity: 2,
    total_price: 798000,
  },

  // Order 26
  {
    order_detail_id: 48,
    order_id: 26,
    variant_id: 53,
    quantity: 1,
    total_price: 2199000,
  },
  {
    order_detail_id: 49,
    order_id: 26,
    variant_id: 15,
    quantity: 1,
    total_price: 790000,
  },

  // Order 27
  {
    order_detail_id: 50,
    order_id: 27,
    variant_id: 37,
    quantity: 1,
    total_price: 2759000,
  },
  {
    order_detail_id: 51,
    order_id: 27,
    variant_id: 30,
    quantity: 1,
    total_price: 1299000,
  },

  // Order 28
  {
    order_detail_id: 52,
    order_id: 28,
    variant_id: 21,
    quantity: 2,
    total_price: 1980000,
  },

  // Order 29
  {
    order_detail_id: 53,
    order_id: 29,
    variant_id: 34,
    quantity: 1,
    total_price: 2599000,
  },
  {
    order_detail_id: 54,
    order_id: 29,
    variant_id: 53,
    quantity: 1,
    total_price: 2199000,
  },

  // Order 30
  {
    order_detail_id: 55,
    order_id: 30,
    variant_id: 53,
    quantity: 1,
    total_price: 2199000,
  },

  // Order 31
  {
    order_detail_id: 56,
    order_id: 31,
    variant_id: 30,
    quantity: 2,
    total_price: 2598000,
  },
  {
    order_detail_id: 57,
    order_id: 31,
    variant_id: 56,
    quantity: 1,
    total_price: 399000,
  },

  // Order 32
  {
    order_detail_id: 58,
    order_id: 32,
    variant_id: 37,
    quantity: 1,
    total_price: 2759000,
  },
  {
    order_detail_id: 59,
    order_id: 32,
    variant_id: 30,
    quantity: 1,
    total_price: 1299000,
  },

  // Order 33
  {
    order_detail_id: 60,
    order_id: 33,
    variant_id: 15,
    quantity: 2,
    total_price: 1580000,
  },
  {
    order_detail_id: 61,
    order_id: 33,
    variant_id: 18,
    quantity: 1,
    total_price: 690000,
  },

  // Order 34
  {
    order_detail_id: 62,
    order_id: 34,
    variant_id: 34,
    quantity: 2,
    total_price: 5198000,
  },
  {
    order_detail_id: 63,
    order_id: 34,
    variant_id: 4,
    quantity: 1,
    total_price: 1200000,
  },

  // Order 35
  {
    order_detail_id: 64,
    order_id: 35,
    variant_id: 53,
    quantity: 1,
    total_price: 2199000,
  },
  {
    order_detail_id: 65,
    order_id: 35,
    variant_id: 56,
    quantity: 1,
    total_price: 399000,
  },

  // Order 36
  {
    order_detail_id: 66,
    order_id: 36,
    variant_id: 21,
    quantity: 2,
    total_price: 1980000,
  },

  // Order 37
  {
    order_detail_id: 67,
    order_id: 37,
    variant_id: 37,
    quantity: 1,
    total_price: 2759000,
  },
  {
    order_detail_id: 68,
    order_id: 37,
    variant_id: 30,
    quantity: 1,
    total_price: 1299000,
  },
  {
    order_detail_id: 69,
    order_id: 37,
    variant_id: 56,
    quantity: 1,
    total_price: 399000,
  },

  // Order 38
  {
    order_detail_id: 70,
    order_id: 38,
    variant_id: 34,
    quantity: 1,
    total_price: 2599000,
  },
  {
    order_detail_id: 71,
    order_id: 38,
    variant_id: 27,
    quantity: 1,
    total_price: 819000,
  },

  // Order 39
  {
    order_detail_id: 72,
    order_id: 39,
    variant_id: 53,
    quantity: 1,
    total_price: 2199000,
  },
  {
    order_detail_id: 73,
    order_id: 39,
    variant_id: 30,
    quantity: 1,
    total_price: 1299000,
  },

  // Order 40
  {
    order_detail_id: 74,
    order_id: 40,
    variant_id: 15,
    quantity: 2,
    total_price: 1580000,
  },
  {
    order_detail_id: 75,
    order_id: 40,
    variant_id: 18,
    quantity: 1,
    total_price: 690000,
  },

  // Order 41
  {
    order_detail_id: 76,
    order_id: 41,
    variant_id: 37,
    quantity: 1,
    total_price: 2759000,
  },
  {
    order_detail_id: 77,
    order_id: 41,
    variant_id: 53,
    quantity: 1,
    total_price: 2199000,
  },

  // Order 42
  {
    order_detail_id: 78,
    order_id: 42,
    variant_id: 34,
    quantity: 1,
    total_price: 2599000,
  },

  // Order 43
  {
    order_detail_id: 79,
    order_id: 43,
    variant_id: 30,
    quantity: 2,
    total_price: 2598000,
  },
  {
    order_detail_id: 80,
    order_id: 43,
    variant_id: 27,
    quantity: 1,
    total_price: 819000,
  },

  // Order 44 - Black Friday (nhiều sản phẩm)
  {
    order_detail_id: 81,
    order_id: 44,
    variant_id: 37,
    quantity: 2,
    total_price: 5518000,
  },
  {
    order_detail_id: 82,
    order_id: 44,
    variant_id: 4,
    quantity: 1,
    total_price: 1200000,
  },

  // Order 45
  {
    order_detail_id: 83,
    order_id: 45,
    variant_id: 34,
    quantity: 1,
    total_price: 2599000,
  },
  {
    order_detail_id: 84,
    order_id: 45,
    variant_id: 56,
    quantity: 1,
    total_price: 399000,
  },

  // Order 46
  {
    order_detail_id: 85,
    order_id: 46,
    variant_id: 37,
    quantity: 1,
    total_price: 2759000,
  },
  {
    order_detail_id: 86,
    order_id: 46,
    variant_id: 30,
    quantity: 1,
    total_price: 1299000,
  },
  {
    order_detail_id: 87,
    order_id: 46,
    variant_id: 27,
    quantity: 1,
    total_price: 819000,
  },

  // Order 47
  {
    order_detail_id: 88,
    order_id: 47,
    variant_id: 1,
    quantity: 2,
    total_price: 1800000,
  },
  {
    order_detail_id: 89,
    order_id: 47,
    variant_id: 4,
    quantity: 1,
    total_price: 1200000,
  },

  // Order 48
  {
    order_detail_id: 90,
    order_id: 48,
    variant_id: 34,
    quantity: 1,
    total_price: 2599000,
  },
  {
    order_detail_id: 91,
    order_id: 48,
    variant_id: 27,
    quantity: 1,
    total_price: 819000,
  },
  {
    order_detail_id: 92,
    order_id: 48,
    variant_id: 4,
    quantity: 1,
    total_price: 1200000,
  },

  // Order 49
  {
    order_detail_id: 93,
    order_id: 49,
    variant_id: 21,
    quantity: 2,
    total_price: 1980000,
  },

  // Order 50
  {
    order_detail_id: 94,
    order_id: 50,
    variant_id: 53,
    quantity: 1,
    total_price: 2199000,
  },
  {
    order_detail_id: 95,
    order_id: 50,
    variant_id: 27,
    quantity: 1,
    total_price: 819000,
  },

  // Order 51 - Valentine
  {
    order_detail_id: 96,
    order_id: 51,
    variant_id: 37,
    quantity: 1,
    total_price: 2759000,
  },
  {
    order_detail_id: 97,
    order_id: 51,
    variant_id: 53,
    quantity: 1,
    total_price: 2199000,
  },

  // Order 52
  {
    order_detail_id: 98,
    order_id: 52,
    variant_id: 30,
    quantity: 2,
    total_price: 2598000,
  },
  {
    order_detail_id: 99,
    order_id: 52,
    variant_id: 27,
    quantity: 1,
    total_price: 819000,
  },

  // Order 53 - Women's Day
  {
    order_detail_id: 100,
    order_id: 53,
    variant_id: 53,
    quantity: 1,
    total_price: 2199000,
  },
  {
    order_detail_id: 101,
    order_id: 53,
    variant_id: 15,
    quantity: 1,
    total_price: 790000,
  },

  // Order 54
  {
    order_detail_id: 102,
    order_id: 54,
    variant_id: 34,
    quantity: 1,
    total_price: 2599000,
  },

  // Order 55
  {
    order_detail_id: 103,
    order_id: 55,
    variant_id: 37,
    quantity: 1,
    total_price: 2759000,
  },
  {
    order_detail_id: 104,
    order_id: 55,
    variant_id: 30,
    quantity: 1,
    total_price: 1299000,
  },

  // Order 56
  {
    order_detail_id: 105,
    order_id: 56,
    variant_id: 53,
    quantity: 1,
    total_price: 2199000,
  },
  {
    order_detail_id: 106,
    order_id: 56,
    variant_id: 27,
    quantity: 1,
    total_price: 819000,
  },

  // Order 57
  {
    order_detail_id: 107,
    order_id: 57,
    variant_id: 37,
    quantity: 1,
    total_price: 2759000,
  },
  {
    order_detail_id: 108,
    order_id: 57,
    variant_id: 53,
    quantity: 1,
    total_price: 2199000,
  },

  // Order 58
  {
    order_detail_id: 109,
    order_id: 58,
    variant_id: 34,
    quantity: 1,
    total_price: 2599000,
  },

  // Order 59
  {
    order_detail_id: 110,
    order_id: 59,
    variant_id: 30,
    quantity: 2,
    total_price: 2598000,
  },
  {
    order_detail_id: 111,
    order_id: 59,
    variant_id: 27,
    quantity: 1,
    total_price: 819000,
  },

  // Order 60
  {
    order_detail_id: 112,
    order_id: 60,
    variant_id: 15,
    quantity: 2,
    total_price: 1580000,
  },
  {
    order_detail_id: 113,
    order_id: 60,
    variant_id: 18,
    quantity: 1,
    total_price: 690000,
  },

  // Order 61
  {
    order_detail_id: 114,
    order_id: 61,
    variant_id: 37,
    quantity: 2,
    total_price: 5518000,
  },

  // Order 62
  {
    order_detail_id: 115,
    order_id: 62,
    variant_id: 34,
    quantity: 1,
    total_price: 2599000,
  },
  {
    order_detail_id: 116,
    order_id: 62,
    variant_id: 56,
    quantity: 1,
    total_price: 399000,
  },

  // Order 63
  {
    order_detail_id: 117,
    order_id: 63,
    variant_id: 37,
    quantity: 1,
    total_price: 2759000,
  },
  {
    order_detail_id: 118,
    order_id: 63,
    variant_id: 30,
    quantity: 1,
    total_price: 1299000,
  },

  // Order 64
  {
    order_detail_id: 119,
    order_id: 64,
    variant_id: 53,
    quantity: 1,
    total_price: 2199000,
  },

  // Order 65
  {
    order_detail_id: 120,
    order_id: 65,
    variant_id: 37,
    quantity: 1,
    total_price: 2759000,
  },
  {
    order_detail_id: 121,
    order_id: 65,
    variant_id: 30,
    quantity: 1,
    total_price: 1299000,
  },
  {
    order_detail_id: 122,
    order_id: 65,
    variant_id: 27,
    quantity: 1,
    total_price: 819000,
  },

  // Order 66
  {
    order_detail_id: 123,
    order_id: 66,
    variant_id: 34,
    quantity: 1,
    total_price: 2599000,
  },
  {
    order_detail_id: 124,
    order_id: 66,
    variant_id: 27,
    quantity: 1,
    total_price: 819000,
  },

  // Order 67
  {
    order_detail_id: 125,
    order_id: 67,
    variant_id: 21,
    quantity: 2,
    total_price: 1980000,
  },

  // Order 68 - Đang giao
  {
    order_detail_id: 126,
    order_id: 68,
    variant_id: 37,
    quantity: 2,
    total_price: 5518000,
  },

  // Order 69 - Đang xử lý
  {
    order_detail_id: 127,
    order_id: 69,
    variant_id: 53,
    quantity: 1,
    total_price: 2199000,
  },
  {
    order_detail_id: 128,
    order_id: 69,
    variant_id: 56,
    quantity: 1,
    total_price: 399000,
  },

  // Order 70 - Đã xác nhận
  {
    order_detail_id: 129,
    order_id: 70,
    variant_id: 37,
    quantity: 1,
    total_price: 2759000,
  },
  {
    order_detail_id: 130,
    order_id: 70,
    variant_id: 30,
    quantity: 1,
    total_price: 1299000,
  },

  // Order 71 - Chờ xác nhận
  {
    order_detail_id: 131,
    order_id: 71,
    variant_id: 15,
    quantity: 2,
    total_price: 1580000,
  },
  {
    order_detail_id: 132,
    order_id: 71,
    variant_id: 18,
    quantity: 1,
    total_price: 690000,
  },
];

// ---- DATASET ORDER_STATUS_HISTORY ----
const orderStatusHistoryData: any[] = [];
let historyId = 1;

// Generate history for all orders
for (const order of ordersData) {
  const orderDate = new Date(order.created_at);

  // Pending status
  orderStatusHistoryData.push({
    order_update_id: historyId++,
    order_id: order.order_id,
    user_id: null,
    status: 'pending',
    created_at: orderDate,
  });

  // Only generate full history for delivered orders
  if (order.order_status === 'delivered') {
    // Confirmed (1 hour later)
    orderStatusHistoryData.push({
      order_update_id: historyId++,
      order_id: order.order_id,
      user_id: 2, // Staff
      status: 'confirmed',
      created_at: new Date(orderDate.getTime() + 1 * 60 * 60 * 1000),
    });

    // Processing (3 hours later)
    orderStatusHistoryData.push({
      order_update_id: historyId++,
      order_id: order.order_id,
      user_id: 2,
      status: 'processing',
      created_at: new Date(orderDate.getTime() + 3 * 60 * 60 * 1000),
    });

    // Shipping (1 day later)
    orderStatusHistoryData.push({
      order_update_id: historyId++,
      order_id: order.order_id,
      user_id: 2,
      status: 'shipping',
      created_at: new Date(orderDate.getTime() + 24 * 60 * 60 * 1000),
    });

    // Delivered (2 days later)
    orderStatusHistoryData.push({
      order_update_id: historyId++,
      order_id: order.order_id,
      user_id: null,
      status: 'delivered',
      created_at: new Date(orderDate.getTime() + 48 * 60 * 60 * 1000),
    });
  } else if (order.order_status === 'shipping') {
    // Confirmed
    orderStatusHistoryData.push({
      order_update_id: historyId++,
      order_id: order.order_id,
      user_id: 2,
      status: 'confirmed',
      created_at: new Date(orderDate.getTime() + 1 * 60 * 60 * 1000),
    });

    // Processing
    orderStatusHistoryData.push({
      order_update_id: historyId++,
      order_id: order.order_id,
      user_id: 2,
      status: 'processing',
      created_at: new Date(orderDate.getTime() + 3 * 60 * 60 * 1000),
    });

    // Shipping
    orderStatusHistoryData.push({
      order_update_id: historyId++,
      order_id: order.order_id,
      user_id: 2,
      status: 'shipping',
      created_at: new Date(orderDate.getTime() + 24 * 60 * 60 * 1000),
    });
  } else if (order.order_status === 'processing') {
    // Confirmed
    orderStatusHistoryData.push({
      order_update_id: historyId++,
      order_id: order.order_id,
      user_id: 2,
      status: 'confirmed',
      created_at: new Date(orderDate.getTime() + 1 * 60 * 60 * 1000),
    });

    // Processing
    orderStatusHistoryData.push({
      order_update_id: historyId++,
      order_id: order.order_id,
      user_id: 2,
      status: 'processing',
      created_at: new Date(orderDate.getTime() + 3 * 60 * 60 * 1000),
    });
  } else if (order.order_status === 'confirmed') {
    // Confirmed
    orderStatusHistoryData.push({
      order_update_id: historyId++,
      order_id: order.order_id,
      user_id: 2,
      status: 'confirmed',
      created_at: new Date(orderDate.getTime() + 1 * 60 * 60 * 1000),
    });
  }
  // pending orders only have initial pending status
}

// ---- SEED FUNCTIONS ----
export async function seedOrders(prisma: PrismaClient) {
  console.log('🛒 Seeding orders…');

  for (const order of ordersData) {
    await prisma.orders.upsert({
      where: { order_id: order.order_id },
      update: {
        total_price: order.total_price,
        shipping_fee: order.shipping_fee,
        payment_status: order.payment_status,
        order_status: order.order_status,
        note: order.note,
        created_at: order.created_at,
      },
      create: order,
    });
  }

  console.log(`✅ Inserted/Updated ${ordersData.length} orders`);
}

export async function seedOrderDetails(prisma: PrismaClient) {
  console.log('📦 Seeding order_detail…');

  for (const detail of orderDetailData) {
    await prisma.order_detail.upsert({
      where: { order_detail_id: detail.order_detail_id },
      update: {
        quantity: detail.quantity,
        total_price: detail.total_price,
      },
      create: detail,
    });
  }

  console.log(`✅ Inserted/Updated ${orderDetailData.length} order details`);
}

export async function seedOrderStatusHistory(prisma: PrismaClient) {
  console.log('📜 Seeding order_status_history…');

  for (const history of orderStatusHistoryData) {
    await prisma.order_status_history.upsert({
      where: { order_update_id: history.order_update_id },
      update: {
        status: history.status,
        created_at: history.created_at,
      },
      create: history,
    });
  }

  console.log(`✅ Inserted/Updated ${orderStatusHistoryData.length} status history records`);
}

// ---- MAIN SEED FUNCTION (gọi tất cả) ----
export async function seedOrdersComplete(prisma: PrismaClient) {
  await seedOrders(prisma);
  await seedOrderDetails(prisma);
  await seedOrderStatusHistory(prisma);

  // ✅ THÊM PHẦN NÀY: Reset sequence sau khi seed
  console.log('🔄 Resetting sequences...');

  await prisma.$executeRawUnsafe(`
    SELECT setval('clothing_ecom.orders_order_id_seq', 
                  (SELECT MAX(order_id) FROM clothing_ecom.orders), 
                  true);
  `);

  await prisma.$executeRawUnsafe(`
    SELECT setval('clothing_ecom.order_detail_order_detail_id_seq', 
                  (SELECT MAX(order_detail_id) FROM clothing_ecom.order_detail), 
                  true);
  `);

  await prisma.$executeRawUnsafe(`
    SELECT setval('clothing_ecom.order_status_history_order_update_id_seq', 
                  (SELECT MAX(order_update_id) FROM clothing_ecom.order_status_history), 
                  true);
  `);

  console.log('✅ Sequences reset successfully!');

  console.log('✅ All order data seeded successfully!');
  console.log(`📊 Summary:`);
  console.log(`   - Orders: ${ordersData.length}`);
  console.log(`   - Order Details: ${orderDetailData.length}`);
  console.log(`   - Status History: ${orderStatusHistoryData.length}`);
  console.log(`   - Date Range: 01/2024 - 10/2025`);
}
