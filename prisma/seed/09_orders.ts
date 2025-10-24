// seed/09_orders.ts
import type { PrismaClient } from '@prisma/client';

// ---- DATASET ORDERS ----
const ordersData = [
  // ===== Đơn hàng của customer_id: 1 (Nguyễn Văn A) =====
  {
    order_id: 1,
    customer_id: 1,
    address_id: 1,
    total_price: 2090000,
    shipping_fee: 30000,
    note: 'Giao giờ hành chính',
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
  },
  {
    order_id: 2,
    customer_id: 1,
    address_id: 2,
    total_price: 1548000,
    shipping_fee: 25000,
    note: null,
    payment_status: 'paid',
    order_status: 'shipping',
    voucher_id: null,
  },
  {
    order_id: 3,
    customer_id: 1,
    address_id: 1,
    total_price: 3098000,
    shipping_fee: 30000,
    note: 'Gọi trước khi giao',
    payment_status: 'pending',
    order_status: 'processing',
    voucher_id: null,
  },

  // ===== Đơn hàng của customer_id: 2 (Nguyễn Văn B) =====
  {
    order_id: 4,
    customer_id: 2,
    address_id: 3,
    total_price: 2199000,
    shipping_fee: 30000,
    note: null,
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
  },
  {
    order_id: 5,
    customer_id: 2,
    address_id: 4,
    total_price: 1638000,
    shipping_fee: 25000,
    note: 'Không giao cuối tuần',
    payment_status: 'paid',
    order_status: 'confirmed',
    voucher_id: null,
  },
  {
    order_id: 6,
    customer_id: 2,
    address_id: 3,
    total_price: 798000,
    shipping_fee: 20000,
    note: null,
    payment_status: 'pending',
    order_status: 'pending',
    voucher_id: null,
  },

  // ===== Đơn hàng guest/demo =====
  {
    order_id: 7,
    customer_id: 1,
    address_id: 1,
    total_price: 4797000,
    shipping_fee: 0, // Free ship
    note: 'Khách VIP - miễn phí ship',
    payment_status: 'paid',
    order_status: 'delivered',
    voucher_id: null,
  },
  {
    order_id: 8,
    customer_id: 2,
    address_id: 3,
    total_price: 1198000,
    shipping_fee: 25000,
    note: null,
    payment_status: 'cancelled',
    order_status: 'cancelled',
    voucher_id: null,
  },
];

// ---- DATASET ORDER_DETAIL ----
const orderDetailData = [
  // === Order 1: 2 sản phẩm Adidas ===
  {
    order_detail_id: 1,
    order_id: 1,
    variant_id: 1, // Adidas Adicolor Jersey S
    quantity: 2,
    total_price: 1800000,
    discount_price: 0,
  },
  {
    order_detail_id: 2,
    order_id: 1,
    variant_id: 4, // Adidas Polo S
    quantity: 1,
    total_price: 1200000,
    discount_price: 100000, // Giảm 100k
  },

  // === Order 2: 2 sản phẩm Nike ===
  {
    order_detail_id: 3,
    order_id: 2,
    variant_id: 27, // Nike Dri-FIT Running T-Shirt S
    quantity: 1,
    total_price: 819000,
    discount_price: 0,
  },
  {
    order_detail_id: 4,
    order_id: 2,
    variant_id: 41, // Nike Challenger Shorts S
    quantity: 1,
    total_price: 999000,
    discount_price: 50000,
  },

  // === Order 3: Mix brands ===
  {
    order_detail_id: 5,
    order_id: 3,
    variant_id: 8, // Adidas Twistweave Pants S
    quantity: 1,
    total_price: 1300000,
    discount_price: 0,
  },
  {
    order_detail_id: 6,
    order_id: 3,
    variant_id: 34, // Nike Stride UV Jacket S
    quantity: 1,
    total_price: 2599000,
    discount_price: 100000,
  },

  // === Order 4: Women's Nike ===
  {
    order_detail_id: 7,
    order_id: 4,
    variant_id: 53, // Nike High-Waisted Trousers S
    quantity: 1,
    total_price: 2199000,
    discount_price: 0,
  },

  // === Order 5: Women's mix ===
  {
    order_detail_id: 8,
    order_id: 5,
    variant_id: 15, // Adidas 3-Stripes Tee W S
    quantity: 2,
    total_price: 1580000,
    discount_price: 0,
  },
  {
    order_detail_id: 9,
    order_id: 5,
    variant_id: 50, // Nike Court Skirt S
    quantity: 1,
    total_price: 1399000,
    discount_price: 50000,
  },

  // === Order 6: Uniqlo ===
  {
    order_detail_id: 10,
    order_id: 6,
    variant_id: 56, // Uniqlo Milano Tee S
    quantity: 2,
    total_price: 798000,
    discount_price: 0,
  },

  // === Order 7: Large order - multiple items ===
  {
    order_detail_id: 11,
    order_id: 7,
    variant_id: 30, // Nike Heavyweight Polo S
    quantity: 2,
    total_price: 2598000,
    discount_price: 0,
  },
  {
    order_detail_id: 12,
    order_id: 7,
    variant_id: 37, // Nike Victory Golf Trousers S
    quantity: 1,
    total_price: 2759000,
    discount_price: 100000,
  },
  {
    order_detail_id: 13,
    order_id: 7,
    variant_id: 11, // Adidas Z.N.E. Shorts S
    quantity: 2,
    total_price: 2500000,
    discount_price: 0,
  },

  // === Order 8: Cancelled order ===
  {
    order_detail_id: 14,
    order_id: 8,
    variant_id: 59, // Uniqlo Flannel Shirt S
    quantity: 2,
    total_price: 1198000,
    discount_price: 0,
  },
];

// ---- DATASET ORDER_STATUS_HISTORY ----
const orderStatusHistoryData = [
  // === Order 1: Đã giao ===
  {
    order_update_id: 1,
    order_id: 1,
    user_id: 1, // Admin tạo
    status: 'pending',
    created_at: new Date('2025-01-15T10:00:00'),
  },
  {
    order_update_id: 2,
    order_id: 1,
    user_id: 2, // Staff xác nhận
    status: 'confirmed',
    created_at: new Date('2025-01-15T11:00:00'),
  },
  {
    order_update_id: 3,
    order_id: 1,
    user_id: 2,
    status: 'processing',
    created_at: new Date('2025-01-15T14:00:00'),
  },
  {
    order_update_id: 4,
    order_id: 1,
    user_id: 2,
    status: 'shipping',
    created_at: new Date('2025-01-16T09:00:00'),
  },
  {
    order_update_id: 5,
    order_id: 1,
    user_id: null, // Hệ thống tự động
    status: 'delivered',
    created_at: new Date('2025-01-17T16:30:00'),
  },

  // === Order 2: Đang giao ===
  {
    order_update_id: 6,
    order_id: 2,
    user_id: null,
    status: 'pending',
    created_at: new Date('2025-01-20T14:00:00'),
  },
  {
    order_update_id: 7,
    order_id: 2,
    user_id: 2,
    status: 'confirmed',
    created_at: new Date('2025-01-20T15:00:00'),
  },
  {
    order_update_id: 8,
    order_id: 2,
    user_id: 2,
    status: 'processing',
    created_at: new Date('2025-01-20T17:00:00'),
  },
  {
    order_update_id: 9,
    order_id: 2,
    user_id: 2,
    status: 'shipping',
    created_at: new Date('2025-01-21T08:00:00'),
  },

  // === Order 3: Đang xử lý ===
  {
    order_update_id: 10,
    order_id: 3,
    user_id: null,
    status: 'pending',
    created_at: new Date('2025-01-23T09:00:00'),
  },
  {
    order_update_id: 11,
    order_id: 3,
    user_id: 2,
    status: 'confirmed',
    created_at: new Date('2025-01-23T10:00:00'),
  },
  {
    order_update_id: 12,
    order_id: 3,
    user_id: 2,
    status: 'processing',
    created_at: new Date('2025-01-23T11:00:00'),
  },

  // === Order 4: Đã giao ===
  {
    order_update_id: 13,
    order_id: 4,
    user_id: null,
    status: 'pending',
    created_at: new Date('2025-01-10T10:00:00'),
  },
  {
    order_update_id: 14,
    order_id: 4,
    user_id: 2,
    status: 'confirmed',
    created_at: new Date('2025-01-10T11:00:00'),
  },
  {
    order_update_id: 15,
    order_id: 4,
    user_id: 2,
    status: 'processing',
    created_at: new Date('2025-01-10T14:00:00'),
  },
  {
    order_update_id: 16,
    order_id: 4,
    user_id: 2,
    status: 'shipping',
    created_at: new Date('2025-01-11T09:00:00'),
  },
  {
    order_update_id: 17,
    order_id: 4,
    user_id: null,
    status: 'delivered',
    created_at: new Date('2025-01-12T15:00:00'),
  },

  // === Order 5: Đã xác nhận ===
  {
    order_update_id: 18,
    order_id: 5,
    user_id: null,
    status: 'pending',
    created_at: new Date('2025-01-22T16:00:00'),
  },
  {
    order_update_id: 19,
    order_id: 5,
    user_id: 2,
    status: 'confirmed',
    created_at: new Date('2025-01-23T09:00:00'),
  },

  // === Order 6: Chờ xử lý ===
  {
    order_update_id: 20,
    order_id: 6,
    user_id: null,
    status: 'pending',
    created_at: new Date('2025-01-24T10:00:00'),
  },

  // === Order 7: Đã giao (VIP) ===
  {
    order_update_id: 21,
    order_id: 7,
    user_id: 1,
    status: 'pending',
    created_at: new Date('2025-01-05T10:00:00'),
  },
  {
    order_update_id: 22,
    order_id: 7,
    user_id: 1,
    status: 'confirmed',
    created_at: new Date('2025-01-05T10:30:00'),
  },
  {
    order_update_id: 23,
    order_id: 7,
    user_id: 1,
    status: 'processing',
    created_at: new Date('2025-01-05T11:00:00'),
  },
  {
    order_update_id: 24,
    order_id: 7,
    user_id: 2,
    status: 'shipping',
    created_at: new Date('2025-01-06T08:00:00'),
  },
  {
    order_update_id: 25,
    order_id: 7,
    user_id: null,
    status: 'delivered',
    created_at: new Date('2025-01-07T14:00:00'),
  },

  // === Order 8: Đã hủy ===
  {
    order_update_id: 26,
    order_id: 8,
    user_id: null,
    status: 'pending',
    created_at: new Date('2025-01-18T10:00:00'),
  },
  {
    order_update_id: 27,
    order_id: 8,
    user_id: 2,
    status: 'confirmed',
    created_at: new Date('2025-01-18T11:00:00'),
  },
  {
    order_update_id: 28,
    order_id: 8,
    user_id: 3, // Khách hàng hủy
    status: 'cancelled',
    created_at: new Date('2025-01-18T15:00:00'),
  },
];

// ---- SEED FUNCTIONS ----
export async function seedOrders(prisma: PrismaClient) {
  console.log('🛒 Seeding orders…');

  // Upsert orders
  for (const order of ordersData) {
    await prisma.orders.upsert({
      where: { order_id: order.order_id },
      update: {
        total_price: order.total_price,
        shipping_fee: order.shipping_fee,
        payment_status: order.payment_status,
        order_status: order.order_status,
        note: order.note,
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
        discount_price: detail.discount_price,
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
  console.log('✅ All order data seeded successfully!');
}
