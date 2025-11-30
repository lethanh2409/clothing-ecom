// seed/06.variants.manual.full.ts
import {
  brands,
  PrismaClient,
  product_variants,
  products,
  categories,
  sizes,
} from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

// ===== DANH SÁCH VARIANTS THỦ CÔNG =====
const variantsData = [
  // 1) Adicolor Jacquard Jersey (Men) – tops: S/M/L
  {
    product_id: 1,
    size_id: 1,
    sku: 'ADI-AJJ-M-BLK-S',
    barcode: '10000000',
    base_price: 900000,
    quantity: 100,
    status: true,
    attribute: {
      'chất liệu': 'cotton jacquard',
      form: 'regular',
      màu: 'black',
      'phong cách': 'originals',
    },
    tags: [
      'đi chơi',
      'đi dạo',
      'café',
      'hẹn hò',
      'dạo phố',
      'đi học',
      'casual',
      'streetwear',
      'du lịch',
      'picnic',
    ],
  },
  {
    product_id: 1,
    size_id: 2,
    sku: 'ADI-AJJ-M-BLK-M',
    barcode: '10000001',
    base_price: 900000,
    quantity: 80,
    status: true,
    attribute: {
      'chất liệu': 'cotton jacquard',
      form: 'regular',
      màu: 'black',
      'phong cách': 'originals',
    },
    tags: [
      'đi chơi',
      'đi dạo',
      'café',
      'hẹn hò',
      'dạo phố',
      'đi học',
      'casual',
      'streetwear',
      'du lịch',
      'picnic',
    ],
  },
  {
    product_id: 1,
    size_id: 3,
    sku: 'ADI-AJJ-M-BLK-L',
    barcode: '10000002',
    base_price: 900000,
    quantity: 65,
    status: true,
    attribute: {
      'chất liệu': 'cotton jacquard',
      form: 'regular',
      màu: 'black',
      'phong cách': 'originals',
    },
    tags: [
      'đi chơi',
      'đi dạo',
      'café',
      'hẹn hò',
      'dạo phố',
      'đi học',
      'casual',
      'streetwear',
      'du lịch',
      'picnic',
    ],
  },

  // 2) Originals Twistknit Trefoil Polo Shirt (Men) – tops: S/M/L/XL
  {
    product_id: 2,
    size_id: 1,
    sku: 'ADI-OTTP-M-WHT-S',
    barcode: '10000003',
    base_price: 1200000,
    quantity: 10,
    status: true,
    attribute: {
      'chất liệu': 'cotton pique',
      'kiểu dáng': 'thanh lịch',
      màu: 'white',
    },
    tags: [
      'đi làm',
      'họp hành',
      'gặp gỡ đối tác',
      'sự kiện',
      'tiệc tùng',
      'hẹn hò',
      'smart casual',
      'đi chơi golf',
      'du lịch',
      'đi dạo',
    ],
  },
  {
    product_id: 2,
    size_id: 2,
    sku: 'ADI-OTTP-M-WHT-M',
    barcode: '10000004',
    base_price: 1200000,
    quantity: 20,
    status: true,
    attribute: {
      'chất liệu': 'cotton pique',
      'kiểu dáng': 'thanh lịch',
      màu: 'white',
    },
    tags: [
      'đi làm',
      'họp hành',
      'gặp gỡ đối tác',
      'sự kiện',
      'tiệc tùng',
      'hẹn hò',
      'smart casual',
      'đi chơi golf',
      'du lịch',
      'đi dạo',
    ],
  },
  {
    product_id: 2,
    size_id: 3,
    sku: 'ADI-OTTP-M-WHT-L',
    barcode: '10000005',
    base_price: 1200000,
    quantity: 30,
    status: true,
    attribute: {
      'chất liệu': 'cotton pique',
      'kiểu dáng': 'thanh lịch',
      màu: 'white',
    },
    tags: [
      'đi làm',
      'họp hành',
      'gặp gỡ đối tác',
      'sự kiện',
      'tiệc tùng',
      'hẹn hò',
      'smart casual',
      'đi chơi golf',
      'du lịch',
      'đi dạo',
    ],
  },
  {
    product_id: 2,
    size_id: 4,
    sku: 'ADI-OTTP-M-WHT-XL',
    barcode: '10000006',
    base_price: 1200000,
    quantity: 15,
    status: true,
    attribute: {
      'chất liệu': 'cotton pique',
      'kiểu dáng': 'thanh lịch',
      màu: 'white',
    },
    tags: [
      'đi làm',
      'họp hành',
      'gặp gỡ đối tác',
      'sự kiện',
      'tiệc tùng',
      'hẹn hò',
      'smart casual',
      'đi chơi golf',
      'du lịch',
      'đi dạo',
    ],
  },

  // 3) Twistweave Pinstripe Ankle Pants (Men) – pants: S/M/L
  {
    product_id: 3,
    size_id: 1,
    sku: 'ADI-TPAP-M-BLK-S',
    barcode: '10000007',
    base_price: 1300000,
    quantity: 22,
    status: true,
    attribute: {
      'chất liệu': 'poly-viscose',
      'họa tiết': 'pinstripe',
      phom: 'ankle',
      màu: 'black',
    },
    tags: [
      'đi làm',
      'họp hành',
      'sự kiện',
      'gặp gỡ đối tác',
      'tiệc tùng',
      'hẹn hò',
      'formal',
      'smart casual',
      'đám cưới',
      'dự tiệc',
    ],
  },
  {
    product_id: 3,
    size_id: 2,
    sku: 'ADI-TPAP-M-BLK-M',
    barcode: '10000008',
    base_price: 1300000,
    quantity: 26,
    status: true,
    attribute: {
      'chất liệu': 'poly-viscose',
      'họa tiết': 'pinstripe',
      phom: 'ankle',
      màu: 'black',
    },
    tags: [
      'đi làm',
      'họp hành',
      'sự kiện',
      'gặp gỡ đối tác',
      'tiệc tùng',
      'hẹn hò',
      'formal',
      'smart casual',
      'đám cưới',
      'dự tiệc',
    ],
  },
  {
    product_id: 3,
    size_id: 3,
    sku: 'ADI-TPAP-M-BLK-L',
    barcode: '10000009',
    base_price: 1300000,
    quantity: 18,
    status: true,
    attribute: {
      'chất liệu': 'poly-viscose',
      'họa tiết': 'pinstripe',
      phom: 'ankle',
      màu: 'black',
    },
    tags: [
      'đi làm',
      'họp hành',
      'sự kiện',
      'gặp gỡ đối tác',
      'tiệc tùng',
      'hẹn hò',
      'formal',
      'smart casual',
      'đám cưới',
      'dự tiệc',
    ],
  },

  // 4) Z.N.E. Shorts (Men) – shorts: S/M/L/XL
  {
    product_id: 4,
    size_id: 1,
    sku: 'ADI-ZNES-M-BLK-S',
    barcode: '10000010',
    base_price: 1250000,
    quantity: 25,
    status: true,
    attribute: {
      'chất liệu': 'doubleknit',
      'phong cách': 'athleisure',
      màu: 'black',
    },
    tags: [
      'tập gym',
      'chạy bộ',
      'yoga',
      'thể thao',
      'đi biển',
      'đi bơi',
      'leo núi',
      'cắm trại',
      'picnic',
      'đi chơi',
      'athleisure',
      'du lịch',
    ],
  },
  {
    product_id: 4,
    size_id: 2,
    sku: 'ADI-ZNES-M-BLK-M',
    barcode: '10000011',
    base_price: 1250000,
    quantity: 28,
    status: true,
    attribute: {
      'chất liệu': 'doubleknit',
      'phong cách': 'athleisure',
      màu: 'black',
    },
    tags: [
      'tập gym',
      'chạy bộ',
      'yoga',
      'thể thao',
      'đi biển',
      'đi bơi',
      'leo núi',
      'cắm trại',
      'picnic',
      'đi chơi',
      'athleisure',
      'du lịch',
    ],
  },
  {
    product_id: 4,
    size_id: 3,
    sku: 'ADI-ZNES-M-BLK-L',
    barcode: '10000012',
    base_price: 1250000,
    quantity: 18,
    status: true,
    attribute: {
      'chất liệu': 'doubleknit',
      'phong cách': 'athleisure',
      màu: 'black',
    },
    tags: [
      'tập gym',
      'chạy bộ',
      'yoga',
      'thể thao',
      'đi biển',
      'đi bơi',
      'leo núi',
      'cắm trại',
      'picnic',
      'đi chơi',
      'athleisure',
      'du lịch',
    ],
  },
  {
    product_id: 4,
    size_id: 4,
    sku: 'ADI-ZNES-M-BLK-XL',
    barcode: '10000013',
    base_price: 1250000,
    quantity: 12,
    status: true,
    attribute: {
      'chất liệu': 'doubleknit',
      'phong cách': 'athleisure',
      màu: 'black',
    },
    tags: [
      'tập gym',
      'chạy bộ',
      'yoga',
      'thể thao',
      'đi biển',
      'đi bơi',
      'leo núi',
      'cắm trại',
      'picnic',
      'đi chơi',
      'athleisure',
      'du lịch',
    ],
  },

  // 5) Essentials 3-Stripes Cotton Tee (Women) – tops: S/M/L
  {
    product_id: 5,
    size_id: 28,
    sku: 'ADI-E3ST-W-BLK-S',
    barcode: '10000014',
    base_price: 790000,
    quantity: 40,
    status: true,
    attribute: {
      'chất liệu': 'cotton',
      'họa tiết': '3-stripes',
      form: 'regular',
      màu: 'black',
    },
    tags: [
      'tập gym',
      'chạy bộ',
      'yoga',
      'thể thao',
      'đi học',
      'đi chơi',
      'đi dạo',
      'café',
      'dạo phố',
      'casual',
      'streetwear',
      'du lịch',
      'picnic',
      'đi biển',
    ],
  },
  {
    product_id: 5,
    size_id: 29,
    sku: 'ADI-E3ST-W-BLK-M',
    barcode: '10000015',
    base_price: 790000,
    quantity: 35,
    status: true,
    attribute: {
      'chất liệu': 'cotton',
      'họa tiết': '3-stripes',
      form: 'regular',
      màu: 'black',
    },
    tags: [
      'tập gym',
      'chạy bộ',
      'yoga',
      'thể thao',
      'đi học',
      'đi chơi',
      'đi dạo',
      'café',
      'dạo phố',
      'casual',
      'streetwear',
      'du lịch',
      'picnic',
      'đi biển',
    ],
  },
  {
    product_id: 5,
    size_id: 30,
    sku: 'ADI-E3ST-W-BLK-L',
    barcode: '10000016',
    base_price: 790000,
    quantity: 20,
    status: true,
    attribute: {
      'chất liệu': 'cotton',
      'họa tiết': '3-stripes',
      form: 'regular',
      màu: 'black',
    },
    tags: [
      'tập gym',
      'chạy bộ',
      'yoga',
      'thể thao',
      'đi học',
      'đi chơi',
      'đi dạo',
      'café',
      'dạo phố',
      'casual',
      'streetwear',
      'du lịch',
      'picnic',
      'đi biển',
    ],
  },
  // 6) Essentials Small Logo Cotton Lifestyle Tank Top (Women) – tops: S/M/L
  {
    product_id: 6,
    size_id: 28,
    sku: 'ADI-ESLT-W-WHT-S',
    barcode: '10000017',
    base_price: 690000,
    quantity: 30,
    status: true,
    attribute: {
      'chất liệu': 'cotton',
      logo: 'small',
      kiểu: 'tank',
      màu: 'white',
    },
    tags: [
      'tập gym',
      'yoga',
      'chạy bộ',
      'thể thao',
      'đi biển',
      'du lịch',
      'mùa hè',
      'đi chơi',
      'dạo phố',
      'casual',
      'athleisure',
      'picnic',
    ],
  },
  {
    product_id: 6,
    size_id: 29,
    sku: 'ADI-ESLT-W-WHT-M',
    barcode: '10000018',
    base_price: 690000,
    quantity: 28,
    status: true,
    attribute: {
      'chất liệu': 'cotton',
      logo: 'small',
      kiểu: 'tank',
      màu: 'white',
    },
    tags: [
      'tập gym',
      'yoga',
      'chạy bộ',
      'thể thao',
      'đi biển',
      'du lịch',
      'mùa hè',
      'đi chơi',
      'dạo phố',
      'casual',
      'athleisure',
      'picnic',
    ],
  },
  {
    product_id: 6,
    size_id: 30,
    sku: 'ADI-ESLT-W-WHT-L',
    barcode: '10000019',
    base_price: 690000,
    quantity: 24,
    status: true,
    attribute: {
      'chất liệu': 'cotton',
      logo: 'small',
      kiểu: 'tank',
      màu: 'white',
    },
    tags: [
      'tập gym',
      'yoga',
      'chạy bộ',
      'thể thao',
      'đi biển',
      'du lịch',
      'mùa hè',
      'đi chơi',
      'dạo phố',
      'casual',
      'athleisure',
      'picnic',
    ],
  },

  // 7) Adidas All Me Rib 7/8 Leggings (Women) – leggings: S/M/L
  {
    product_id: 7,
    size_id: 28,
    sku: 'ADI-AMR7-W-PRP-S',
    barcode: '10000020',
    base_price: 990000,
    quantity: 26,
    status: true,
    attribute: {
      'chất liệu': 'rib knit',
      'độ dài': '7/8',
      'co giãn': 'tốt',
      màu: 'purple',
    },
    tags: [
      'tập gym',
      'yoga',
      'pilates',
      'thể thao',
      'chạy bộ',
      'tập luyện',
      'athleisure',
      'đi chơi',
      'dạo phố',
      'casual',
      'đi học',
    ],
  },
  {
    product_id: 7,
    size_id: 29,
    sku: 'ADI-AMR7-W-PRP-M',
    barcode: '10000021',
    base_price: 990000,
    quantity: 22,
    status: true,
    attribute: {
      'chất liệu': 'rib knit',
      'độ dài': '7/8',
      'co giãn': 'tốt',
      màu: 'purple',
    },
    tags: [
      'tập gym',
      'yoga',
      'pilates',
      'thể thao',
      'chạy bộ',
      'tập luyện',
      'athleisure',
      'đi chơi',
      'dạo phố',
      'casual',
      'đi học',
    ],
  },
  {
    product_id: 7,
    size_id: 30,
    sku: 'ADI-AMR7-W-PRP-L',
    barcode: '10000022',
    base_price: 990000,
    quantity: 18,
    status: true,
    attribute: {
      'chất liệu': 'rib knit',
      'độ dài': '7/8',
      'co giãn': 'tốt',
      màu: 'purple',
    },
    tags: [
      'tập gym',
      'yoga',
      'pilates',
      'thể thao',
      'chạy bộ',
      'tập luyện',
      'athleisure',
      'đi chơi',
      'dạo phố',
      'casual',
      'đi học',
    ],
  },

  // 8) Adidas Originals GFX Skirt (Women) – skirt: S/M/L
  {
    product_id: 8,
    size_id: 32,
    sku: 'ADI-OGFX-W-BLU-S',
    barcode: '10000023',
    base_price: 850000,
    quantity: 20,
    status: true,
    attribute: {
      'chất liệu': 'poly-cotton',
      'họa tiết': 'graphic',
      màu: 'blue',
    },
    tags: [
      'đi chơi',
      'dạo phố',
      'hẹn hò',
      'café',
      'du lịch',
      'picnic',
      'mùa hè',
      'casual',
      'streetwear',
      'sự kiện',
      'tiệc nhẹ',
      'đi học',
    ],
  },
  {
    product_id: 8,
    size_id: 33,
    sku: 'ADI-OGFX-W-BLU-M',
    barcode: '10000024',
    base_price: 850000,
    quantity: 18,
    status: true,
    attribute: {
      'chất liệu': 'poly-cotton',
      'họa tiết': 'graphic',
      màu: 'blue',
    },
    tags: [
      'đi chơi',
      'dạo phố',
      'hẹn hò',
      'café',
      'du lịch',
      'picnic',
      'mùa hè',
      'casual',
      'streetwear',
      'sự kiện',
      'tiệc nhẹ',
      'đi học',
    ],
  },
  {
    product_id: 8,
    size_id: 34,
    sku: 'ADI-OGFX-W-BLU-L',
    barcode: '10000025',
    base_price: 850000,
    quantity: 14,
    status: true,
    attribute: {
      'chất liệu': 'poly-cotton',
      'họa tiết': 'graphic',
      màu: 'blue',
    },
    tags: [
      'đi chơi',
      'dạo phố',
      'hẹn hò',
      'café',
      'du lịch',
      'picnic',
      'mùa hè',
      'casual',
      'streetwear',
      'sự kiện',
      'tiệc nhẹ',
      'đi học',
    ],
  },

  // ====================== NIKE (brand_id: 2) ======================
  // 9) Nike Dri-FIT Running T-Shirt (Men) – tops: S/M/L
  {
    product_id: 9,
    size_id: 10,
    sku: 'NIK-DFRT-M-BLK-S',
    barcode: '10000026',
    base_price: 819000,
    quantity: 50,
    status: true,
    attribute: {
      'chất liệu': 'polyester',
      'công nghệ': 'Dri-FIT',
      màu: 'black',
      'phong cách': 'running',
    },
    tags: [
      'chạy bộ',
      'tập gym',
      'thể thao',
      'marathon',
      'tập luyện',
      'cardio',
      'jogging',
      'leo núi',
      'cắm trại',
      'outdoor',
      'du lịch',
    ],
  },
  {
    product_id: 9,
    size_id: 11,
    sku: 'NIK-DFRT-M-BLK-M',
    barcode: '10000027',
    base_price: 819000,
    quantity: 60,
    status: true,
    attribute: {
      'chất liệu': 'polyester',
      'công nghệ': 'Dri-FIT',
      màu: 'black',
      'phong cách': 'running',
    },
    tags: [
      'chạy bộ',
      'tập gym',
      'thể thao',
      'marathon',
      'tập luyện',
      'cardio',
      'jogging',
      'leo núi',
      'cắm trại',
      'outdoor',
      'du lịch',
    ],
  },
  {
    product_id: 9,
    size_id: 12,
    sku: 'NIK-DFRT-M-BLK-L',
    barcode: '10000028',
    base_price: 819000,
    quantity: 55,
    status: true,
    attribute: {
      'chất liệu': 'polyester',
      'công nghệ': 'Dri-FIT',
      màu: 'black',
      'phong cách': 'running',
    },
    tags: [
      'chạy bộ',
      'tập gym',
      'thể thao',
      'marathon',
      'tập luyện',
      'cardio',
      'jogging',
      'leo núi',
      'cắm trại',
      'outdoor',
      'du lịch',
    ],
  },

  // 10) Nike Heavyweight Polo (Men) – tops: S/M/L/XL
  {
    product_id: 10,
    size_id: 10,
    sku: 'NIK-HWPO-M-DRED-S',
    barcode: '10000029',
    base_price: 1299000,
    quantity: 18,
    status: true,
    attribute: {
      'chất liệu': 'heavy cotton',
      form: 'relaxed',
      màu: 'dark red',
    },
    tags: [
      'đi chơi',
      'dạo phố',
      'hẹn hò',
      'café',
      'casual',
      'smart casual',
      'du lịch',
      'picnic',
      'đi học',
      'streetwear',
      'weekend',
    ],
  },
  {
    product_id: 10,
    size_id: 11,
    sku: 'NIK-HWPO-M-DRED-M',
    barcode: '10000030',
    base_price: 1299000,
    quantity: 20,
    status: true,
    attribute: {
      'chất liệu': 'heavy cotton',
      form: 'relaxed',
      màu: 'dark red',
    },
    tags: [
      'đi chơi',
      'dạo phố',
      'hẹn hò',
      'café',
      'casual',
      'smart casual',
      'du lịch',
      'picnic',
      'đi học',
      'streetwear',
      'weekend',
    ],
  },
  {
    product_id: 10,
    size_id: 12,
    sku: 'NIK-HWPO-M-DRED-L',
    barcode: '10000031',
    base_price: 1299000,
    quantity: 16,
    status: true,
    attribute: {
      'chất liệu': 'heavy cotton',
      form: 'relaxed',
      màu: 'dark red',
    },
    tags: [
      'đi chơi',
      'dạo phố',
      'hẹn hò',
      'café',
      'casual',
      'smart casual',
      'du lịch',
      'picnic',
      'đi học',
      'streetwear',
      'weekend',
    ],
  },
  {
    product_id: 10,
    size_id: 13,
    sku: 'NIK-HWPO-M-DRED-XL',
    barcode: '10000032',
    base_price: 1299000,
    quantity: 12,
    status: true,
    attribute: {
      'chất liệu': 'heavy cotton',
      form: 'relaxed',
      màu: 'dark red',
    },
    tags: [
      'đi chơi',
      'dạo phố',
      'hẹn hò',
      'café',
      'casual',
      'smart casual',
      'du lịch',
      'picnic',
      'đi học',
      'streetwear',
      'weekend',
    ],
  },

  // 11) Nike Stride Repel UV Running Jacket (Men) – outer: S/M/L
  {
    product_id: 11,
    size_id: 10,
    sku: 'NIK-SRUV-M-WHT-S',
    barcode: '10000033',
    base_price: 2599000,
    quantity: 14,
    status: true,
    attribute: {
      'chất liệu': 'poly woven',
      'tính năng': 'UV repel',
      màu: 'white',
    },
    tags: [
      'chạy bộ',
      'marathon',
      'jogging',
      'outdoor',
      'leo núi',
      'cắm trại',
      'du lịch',
      'trekking',
      'thể thao',
      'cycling',
      'picnic',
    ],
  },
  {
    product_id: 11,
    size_id: 11,
    sku: 'NIK-SRUV-M-WHT-M',
    barcode: '10000034',
    base_price: 2599000,
    quantity: 16,
    status: true,
    attribute: {
      'chất liệu': 'poly woven',
      'tính năng': 'UV repel',
      màu: 'white',
    },
    tags: [
      'chạy bộ',
      'marathon',
      'jogging',
      'outdoor',
      'leo núi',
      'cắm trại',
      'du lịch',
      'trekking',
      'thể thao',
      'cycling',
      'picnic',
    ],
  },
  {
    product_id: 11,
    size_id: 12,
    sku: 'NIK-SRUV-M-WHT-L',
    barcode: '10000035',
    base_price: 2599000,
    quantity: 12,
    status: true,
    attribute: {
      'chất liệu': 'poly woven',
      'tính năng': 'UV repel',
      màu: 'white',
    },
    tags: [
      'chạy bộ',
      'marathon',
      'jogging',
      'outdoor',
      'leo núi',
      'cắm trại',
      'du lịch',
      'trekking',
      'thể thao',
      'cycling',
      'picnic',
    ],
  },

  // 12) Nike Dri-FIT Victory Golf Trousers (Men) – pants: S/M/L/XL
  {
    product_id: 12,
    size_id: 14,
    sku: 'NIK-VGTR-M-BLK-S',
    barcode: '10000036',
    base_price: 2759000,
    quantity: 14,
    status: true,
    attribute: {
      'chất liệu': 'poly-spandex',
      'công nghệ': 'Dri-FIT',
      màu: 'black',
      'phong cách': 'golf',
    },
    tags: [
      'đi chơi golf',
      'golf',
      'thể thao',
      'smart casual',
      'gặp gỡ đối tác',
      'du lịch',
      'resort',
      'country club',
      'outdoor',
    ],
  },
  {
    product_id: 12,
    size_id: 15,
    sku: 'NIK-VGTR-M-BLK-M',
    barcode: '10000037',
    base_price: 2759000,
    quantity: 16,
    status: true,
    attribute: {
      'chất liệu': 'poly-spandex',
      'công nghệ': 'Dri-FIT',
      màu: 'black',
      'phong cách': 'golf',
    },
    tags: [
      'đi chơi golf',
      'golf',
      'thể thao',
      'smart casual',
      'gặp gỡ đối tác',
      'du lịch',
      'resort',
      'country club',
      'outdoor',
    ],
  },
  {
    product_id: 12,
    size_id: 16,
    sku: 'NIK-VGTR-M-BLK-L',
    barcode: '10000038',
    base_price: 2759000,
    quantity: 10,
    status: true,
    attribute: {
      'chất liệu': 'poly-spandex',
      'công nghệ': 'Dri-FIT',
      màu: 'black',
      'phong cách': 'golf',
    },
    tags: [
      'đi chơi golf',
      'golf',
      'thể thao',
      'smart casual',
      'gặp gỡ đối tác',
      'du lịch',
      'resort',
      'country club',
      'outdoor',
    ],
  },
  {
    product_id: 12,
    size_id: 17,
    sku: 'NIK-VGTR-M-BLK-XL',
    barcode: '10000039',
    base_price: 2759000,
    quantity: 8,
    status: true,
    attribute: {
      'chất liệu': 'poly-spandex',
      'công nghệ': 'Dri-FIT',
      màu: 'black',
      'phong cách': 'golf',
    },
    tags: [
      'đi chơi golf',
      'golf',
      'thể thao',
      'smart casual',
      'gặp gỡ đối tác',
      'du lịch',
      'resort',
      'country club',
      'outdoor',
    ],
  },

  // 13) Nike Dri-FIT Challenger Brief-Lined Versatile Shorts (Men) – shorts: S/M/L
  {
    product_id: 13,
    size_id: 14,
    sku: 'NIK-DCBL-M-GRAY-S',
    barcode: '10000040',
    base_price: 999000,
    quantity: 22,
    status: true,
    attribute: {
      'chất liệu': 'poly',
      lót: 'brief',
      màu: 'gray',
    },
    tags: [
      'chạy bộ',
      'tập gym',
      'thể thao',
      'tập luyện',
      'cardio',
      'tennis',
      'đi biển',
      'du lịch',
      'outdoor',
      'picnic',
      'casual',
    ],
  },
  {
    product_id: 13,
    size_id: 15,
    sku: 'NIK-DCBL-M-GRAY-M',
    barcode: '10000041',
    base_price: 999000,
    quantity: 26,
    status: true,
    attribute: {
      'chất liệu': 'poly',
      lót: 'brief',
      màu: 'gray',
    },
    tags: [
      'chạy bộ',
      'tập gym',
      'thể thao',
      'tập luyện',
      'cardio',
      'tennis',
      'đi biển',
      'du lịch',
      'outdoor',
      'picnic',
      'casual',
    ],
  },
  {
    product_id: 13,
    size_id: 16,
    sku: 'NIK-DCBL-M-GRAY-L',
    barcode: '10000042',
    base_price: 999000,
    quantity: 18,
    status: true,
    attribute: {
      'chất liệu': 'poly',
      lót: 'brief',
      màu: 'gray',
    },
    tags: [
      'chạy bộ',
      'tập gym',
      'thể thao',
      'tập luyện',
      'cardio',
      'tennis',
      'đi biển',
      'du lịch',
      'outdoor',
      'picnic',
      'casual',
    ],
  },

  // 14) Just Do It: Nike Basketball T-Shirt (Women) – tops: S/M/L
  {
    product_id: 14,
    size_id: 36,
    sku: 'NIK-JDBT-W-BLK-S',
    barcode: '10000043',
    base_price: 749000,
    quantity: 40,
    status: true,
    attribute: {
      'chất liệu': 'cotton',
      graphic: 'Just Do It Basketball',
      màu: 'black',
    },
    tags: [
      'đi chơi',
      'dạo phố',
      'đi học',
      'café',
      'casual',
      'streetwear',
      'du lịch',
      'tập gym',
      'thể thao',
      'basketball',
      'athleisure',
      'picnic',
    ],
  },
  {
    product_id: 14,
    size_id: 37,
    sku: 'NIK-JDBT-W-BLK-M',
    barcode: '10000044',
    base_price: 749000,
    quantity: 36,
    status: true,
    attribute: {
      'chất liệu': 'cotton',
      graphic: 'Just Do It Basketball',
      màu: 'black',
    },
    tags: [
      'đi chơi',
      'dạo phố',
      'đi học',
      'café',
      'casual',
      'streetwear',
      'du lịch',
      'tập gym',
      'thể thao',
      'basketball',
      'athleisure',
      'picnic',
    ],
  },
  {
    product_id: 14,
    size_id: 38,
    sku: 'NIK-JDBT-W-BLK-L',
    barcode: '10000045',
    base_price: 749000,
    quantity: 28,
    status: true,
    attribute: {
      'chất liệu': 'cotton',
      graphic: 'Just Do It Basketball',
      màu: 'black',
    },
    tags: [
      'đi chơi',
      'dạo phố',
      'đi học',
      'café',
      'casual',
      'streetwear',
      'du lịch',
      'tập gym',
      'thể thao',
      'basketball',
      'athleisure',
      'picnic',
    ],
  },

  // 15) Nike Sportswear Windrunner Jacket (Women) – outer: S/M/L
  {
    product_id: 15,
    size_id: 36,
    sku: 'NIK-WIND-W-BLK-S',
    barcode: '10000046',
    base_price: 2599000,
    quantity: 16,
    status: true,
    attribute: {
      'chất liệu': 'woven',
      'thiết kế': 'Windrunner',
      màu: 'black',
    },
    tags: [
      'chạy bộ',
      'thể thao',
      'outdoor',
      'du lịch',
      'leo núi',
      'cắm trại',
      'đi chơi',
      'athleisure',
      'streetwear',
      'cycling',
      'jogging',
    ],
  },
  {
    product_id: 15,
    size_id: 37,
    sku: 'NIK-WIND-W-BLK-M',
    barcode: '10000047',
    base_price: 2599000,
    quantity: 14,
    status: true,
    attribute: {
      'chất liệu': 'woven',
      'thiết kế': 'Windrunner',
      màu: 'black',
    },
    tags: [
      'chạy bộ',
      'thể thao',
      'outdoor',
      'du lịch',
      'leo núi',
      'cắm trại',
      'đi chơi',
      'athleisure',
      'streetwear',
      'cycling',
      'jogging',
    ],
  },
  {
    product_id: 15,
    size_id: 38,
    sku: 'NIK-WIND-W-BLK-L',
    barcode: '10000048',
    base_price: 2599000,
    quantity: 12,
    status: true,
    attribute: {
      'chất liệu': 'woven',
      'thiết kế': 'Windrunner',
      màu: 'black',
    },
    tags: [
      'chạy bộ',
      'thể thao',
      'outdoor',
      'du lịch',
      'leo núi',
      'cắm trại',
      'đi chơi',
      'athleisure',
      'streetwear',
      'cycling',
      'jogging',
    ],
  },

  // 16) NikeCourt Advantage Dri-FIT Skirt (Women) – skirt: S/M/L
  {
    product_id: 16,
    size_id: 41,
    sku: 'NIK-NCAD-W-BLU-S',
    barcode: '10000049',
    base_price: 1399000,
    quantity: 20,
    status: true,
    attribute: {
      'chất liệu': 'poly-spandex',
      'công nghệ': 'Dri-FIT',
      màu: 'blue',
    },
    tags: [
      'tennis',
      'cầu lông',
      'thể thao',
      'tập luyện',
      'golf',
      'pickleball',
      'athleisure',
      'đi chơi',
      'du lịch',
    ],
  },
  {
    product_id: 16,
    size_id: 42,
    sku: 'NIK-NCAD-W-BLU-M',
    barcode: '10000050',
    base_price: 1399000,
    quantity: 18,
    status: true,
    attribute: {
      'chất liệu': 'poly-spandex',
      'công nghệ': 'Dri-FIT',
      màu: 'blue',
    },
    tags: [
      'tennis',
      'cầu lông',
      'thể thao',
      'tập luyện',
      'golf',
      'pickleball',
      'athleisure',
      'đi chơi',
      'du lịch',
    ],
  },
  {
    product_id: 16,
    size_id: 43,
    sku: 'NIK-NCAD-W-BLU-L',
    barcode: '10000051',
    base_price: 1399000,
    quantity: 16,
    status: true,
    attribute: {
      'chất liệu': 'poly-spandex',
      'công nghệ': 'Dri-FIT',
      màu: 'blue',
    },
    tags: [
      'tennis',
      'cầu lông',
      'thể thao',
      'tập luyện',
      'golf',
      'pickleball',
      'athleisure',
      'đi chơi',
      'du lịch',
    ],
  },

  // 17) Nike High-Waisted Loose Wide-Leg Trousers (Women) – pants: S/M/L
  {
    product_id: 17,
    size_id: 41,
    sku: 'NIK-HWLW-W-BLK-S',
    barcode: '10000052',
    base_price: 2199000,
    quantity: 16,
    status: true,
    attribute: {
      'chất liệu': 'polyester',
      phom: 'wide-leg, high-waist',
      màu: 'black',
    },
    tags: [
      'đi làm',
      'họp hành',
      'smart casual',
      'đi chơi',
      'dạo phố',
      'hẹn hò',
      'café',
      'du lịch',
      'sự kiện',
      'tiệc tùng',
      'thời trang',
    ],
  },
  {
    product_id: 17,
    size_id: 42,
    sku: 'NIK-HWLW-W-BLK-M',
    barcode: '10000053',
    base_price: 2199000,
    quantity: 14,
    status: true,
    attribute: {
      'chất liệu': 'polyester',
      phom: 'wide-leg, high-waist',
      màu: 'black',
    },
    tags: [
      'đi làm',
      'họp hành',
      'smart casual',
      'đi chơi',
      'dạo phố',
      'hẹn hò',
      'café',
      'du lịch',
      'sự kiện',
      'tiệc tùng',
      'thời trang',
    ],
  },
  {
    product_id: 17,
    size_id: 43,
    sku: 'NIK-HWLW-W-BLK-L',
    barcode: '10000054',
    base_price: 2199000,
    quantity: 12,
    status: true,
    attribute: {
      'chất liệu': 'polyester',
      phom: 'wide-leg, high-waist',
      màu: 'black',
    },
    tags: [
      'đi làm',
      'họp hành',
      'smart casual',
      'đi chơi',
      'dạo phố',
      'hẹn hò',
      'café',
      'du lịch',
      'sự kiện',
      'tiệc tùng',
      'thời trang',
    ],
  },

  // ====================== UNIQLO (brand_id: 3) ======================
  // 18) UNIQLO Áo Thun Milano Vải Gân (Men) – tops: S/M/L
  {
    product_id: 18,
    size_id: 19,
    sku: 'UQL-MILN-M-BEI-S',
    barcode: '10000055',
    base_price: 399000,
    quantity: 60,
    status: true,
    attribute: {
      'chất liệu': 'milano rib',
      form: 'regular',
      màu: 'beige',
    },
    tags: [
      'đi học',
      'đi chơi',
      'dạo phố',
      'café',
      'hẹn hò',
      'casual',
      'du lịch',
      'picnic',
      'đi dạo',
      'weekend',
      'minimalist',
    ],
  },
  {
    product_id: 18,
    size_id: 20,
    sku: 'UQL-MILN-M-BEI-M',
    barcode: '10000056',
    base_price: 399000,
    quantity: 54,
    status: true,
    attribute: {
      'chất liệu': 'milano rib',
      form: 'regular',
      màu: 'beige',
    },
    tags: [
      'đi học',
      'đi chơi',
      'dạo phố',
      'café',
      'hẹn hò',
      'casual',
      'du lịch',
      'picnic',
      'đi dạo',
      'weekend',
      'minimalist',
    ],
  },
  {
    product_id: 18,
    size_id: 21,
    sku: 'UQL-MILN-M-BEI-L',
    barcode: '10000057',
    base_price: 399000,
    quantity: 48,
    status: true,
    attribute: {
      'chất liệu': 'milano rib',
      form: 'regular',
      màu: 'beige',
    },
    tags: [
      'đi học',
      'đi chơi',
      'dạo phố',
      'café',
      'hẹn hò',
      'casual',
      'du lịch',
      'picnic',
      'đi dạo',
      'weekend',
      'minimalist',
    ],
  },

  // 19) UNIQLO Áo Sơ Mi Vải Dạ | Caro (Men) – shirts: S/M/L/XL
  {
    product_id: 19,
    size_id: 19,
    sku: 'UQL-FLNL-M-RED-S',
    barcode: '10000058',
    base_price: 599000,
    quantity: 24,
    status: true,
    attribute: {
      'chất liệu': 'flannel',
      'họa tiết': 'caro',
      màu: 'red',
    },
    tags: [
      'đi chơi',
      'dạo phố',
      'café',
      'hẹn hò',
      'du lịch',
      'leo núi',
      'cắm trại',
      'picnic',
      'outdoor',
      'casual',
      'mùa thu',
      'mùa đông',
    ],
  },
  {
    product_id: 19,
    size_id: 20,
    sku: 'UQL-FLNL-M-RED-M',
    barcode: '10000059',
    base_price: 599000,
    quantity: 22,
    status: true,
    attribute: {
      'chất liệu': 'flannel',
      'họa tiết': 'caro',
      màu: 'red',
    },
    tags: [
      'đi chơi',
      'dạo phố',
      'café',
      'hẹn hò',
      'du lịch',
      'leo núi',
      'cắm trại',
      'picnic',
      'outdoor',
      'casual',
      'mùa thu',
      'mùa đông',
    ],
  },
  {
    product_id: 19,
    size_id: 21,
    sku: 'UQL-FLNL-M-RED-L',
    barcode: '10000060',
    base_price: 599000,
    quantity: 18,
    status: true,
    attribute: {
      'chất liệu': 'flannel',
      'họa tiết': 'caro',
      màu: 'red',
    },
    tags: [
      'đi chơi',
      'dạo phố',
      'café',
      'hẹn hò',
      'du lịch',
      'leo núi',
      'cắm trại',
      'picnic',
      'outdoor',
      'casual',
      'mùa thu',
      'mùa đông',
    ],
  },
  {
    product_id: 19,
    size_id: 22,
    sku: 'UQL-FLNL-M-RED-XL',
    barcode: '10000061',
    base_price: 599000,
    quantity: 12,
    status: true,
    attribute: {
      'chất liệu': 'flannel',
      'họa tiết': 'caro',
      màu: 'red',
    },
    tags: [
      'đi chơi',
      'dạo phố',
      'café',
      'hẹn hò',
      'du lịch',
      'leo núi',
      'cắm trại',
      'picnic',
      'outdoor',
      'casual',
      'mùa thu',
      'mùa đông',
    ],
  },

  // 20) UNIQLO Quần Jeans Dáng Rộng Ống Suông (Men) – jeans: S/M/L
  {
    product_id: 20,
    size_id: 24,
    sku: 'UQL-JNSW-M-BLK-S',
    barcode: '10000062',
    base_price: 799000,
    quantity: 22,
    status: true,
    attribute: {
      'chất liệu': 'denim',
      phom: 'wide straight',
      màu: 'black',
    },
    tags: [
      'đi chơi',
      'dạo phố',
      'đi học',
      'café',
      'hẹn hò',
      'casual',
      'streetwear',
      'du lịch',
      'picnic',
      'concert',
      'sự kiện',
    ],
  },
  {
    product_id: 20,
    size_id: 25,
    sku: 'UQL-JNSW-M-BLK-M',
    barcode: '10000063',
    base_price: 799000,
    quantity: 26,
    status: true,
    attribute: {
      'chất liệu': 'denim',
      phom: 'wide straight',
      màu: 'black',
    },
    tags: [
      'đi chơi',
      'dạo phố',
      'đi học',
      'café',
      'hẹn hò',
      'casual',
      'streetwear',
      'du lịch',
      'picnic',
      'concert',
      'sự kiện',
    ],
  },
  {
    product_id: 20,
    size_id: 26,
    sku: 'UQL-JNSW-M-BLK-L',
    barcode: '10000064',
    base_price: 799000,
    quantity: 18,
    status: true,
    attribute: {
      'chất liệu': 'denim',
      phom: 'wide straight',
      màu: 'black',
    },
    tags: [
      'đi chơi',
      'dạo phố',
      'đi học',
      'café',
      'hẹn hò',
      'casual',
      'streetwear',
      'du lịch',
      'picnic',
      'concert',
      'sự kiện',
    ],
  },

  // 21) UNIQLO Quần Short Vải Jersey (Men) – shorts: S/M/L
  {
    product_id: 21,
    size_id: 24,
    sku: 'UQL-JERS-M-BRW-S',
    barcode: '10000065',
    base_price: 399000,
    quantity: 40,
    status: true,
    attribute: {
      'chất liệu': 'jersey',
      form: 'regular',
      màu: 'brown',
    },
    tags: [
      'đi chơi',
      'dạo phố',
      'đi biển',
      'du lịch',
      'picnic',
      'mùa hè',
      'casual',
      'athleisure',
      'tập gym',
      'yoga',
      'cắm trại',
    ],
  },
  {
    product_id: 21,
    size_id: 25,
    sku: 'UQL-JERS-M-BRW-M',
    barcode: '10000066',
    base_price: 399000,
    quantity: 36,
    status: true,
    attribute: {
      'chất liệu': 'jersey',
      form: 'regular',
      màu: 'brown',
    },
    tags: [
      'đi chơi',
      'dạo phố',
      'đi biển',
      'du lịch',
      'picnic',
      'mùa hè',
      'casual',
      'athleisure',
      'tập gym',
      'yoga',
      'cắm trại',
    ],
  },
  {
    product_id: 21,
    size_id: 26,
    sku: 'UQL-JERS-M-BRW-L',
    barcode: '10000067',
    base_price: 399000,
    quantity: 28,
    status: true,
    attribute: {
      'chất liệu': 'jersey',
      form: 'regular',
      màu: 'brown',
    },
    tags: [
      'đi chơi',
      'dạo phố',
      'đi biển',
      'du lịch',
      'picnic',
      'mùa hè',
      'casual',
      'athleisure',
      'tập gym',
      'yoga',
      'cắm trại',
    ],
  },

  // 22) UNIQLO Áo Thun AIRism Cotton (Women) – tops: S/M/L
  {
    product_id: 22,
    size_id: 45,
    sku: 'UQL-AIRM-W-BLK-S',
    barcode: '10000068',
    base_price: 299000,
    quantity: 70,
    status: true,
    attribute: {
      'chất liệu': 'AIRism cotton',
      form: 'regular',
      màu: 'black',
    },
    tags: [
      'đi học',
      'đi chơi',
      'dạo phố',
      'café',
      'du lịch',
      'mùa hè',
      'casual',
      'minimalist',
      'đi biển',
      'picnic',
      'thoáng mát',
      'hằng ngày',
    ],
  },
  {
    product_id: 22,
    size_id: 46,
    sku: 'UQL-AIRM-W-BLK-M',
    barcode: '10000069',
    base_price: 299000,
    quantity: 64,
    status: true,
    attribute: {
      'chất liệu': 'AIRism cotton',
      form: 'regular',
      màu: 'black',
    },
    tags: [
      'đi học',
      'đi chơi',
      'dạo phố',
      'café',
      'du lịch',
      'mùa hè',
      'casual',
      'minimalist',
      'đi biển',
      'picnic',
      'thoáng mát',
      'hằng ngày',
    ],
  },
  {
    product_id: 22,
    size_id: 47,
    sku: 'UQL-AIRM-W-BLK-L',
    barcode: '10000070',
    base_price: 299000,
    quantity: 58,
    status: true,
    attribute: {
      'chất liệu': 'AIRism cotton',
      form: 'regular',
      màu: 'black',
    },
    tags: [
      'đi học',
      'đi chơi',
      'dạo phố',
      'café',
      'du lịch',
      'mùa hè',
      'casual',
      'minimalist',
      'đi biển',
      'picnic',
      'thoáng mát',
      'hằng ngày',
    ],
  },

  // 23) UNIQLO Áo Hoodie Nỉ Dry Kéo Khóa (Women) – outer: S/M/L
  {
    product_id: 23,
    size_id: 45,
    sku: 'UQL-DRYH-W-NAVY-S',
    barcode: '10000071',
    base_price: 699000,
    quantity: 24,
    status: true,
    attribute: {
      'chất liệu': 'french terry',
      'tính năng': 'DRY',
      màu: 'navy',
    },
    tags: [
      'tập gym',
      'thể thao',
      'chạy bộ',
      'yoga',
      'đi chơi',
      'dạo phố',
      'du lịch',
      'casual',
      'athleisure',
      'mùa thu',
      'mùa đông',
      'leo núi',
    ],
  },
  {
    product_id: 23,
    size_id: 46,
    sku: 'UQL-DRYH-W-NAVY-M',
    barcode: '10000072',
    base_price: 699000,
    quantity: 22,
    status: true,
    attribute: {
      'chất liệu': 'french terry',
      'tính năng': 'DRY',
      màu: 'navy',
    },
    tags: [
      'tập gym',
      'thể thao',
      'chạy bộ',
      'yoga',
      'đi chơi',
      'dạo phố',
      'du lịch',
      'casual',
      'athleisure',
      'mùa thu',
      'mùa đông',
      'leo núi',
    ],
  },
  {
    product_id: 23,
    size_id: 47,
    sku: 'UQL-DRYH-W-NAVY-L',
    barcode: '10000073',
    base_price: 699000,
    quantity: 18,
    status: true,
    attribute: {
      'chất liệu': 'french terry',
      'tính năng': 'DRY',
      màu: 'navy',
    },
    tags: [
      'tập gym',
      'thể thao',
      'chạy bộ',
      'yoga',
      'đi chơi',
      'dạo phố',
      'du lịch',
      'casual',
      'athleisure',
      'mùa thu',
      'mùa đông',
      'leo núi',
    ],
  },

  // 24) UNIQLO Quần Jeans Ống Loe Rộng Dáng Rũ (Women) – jeans: S/M/L
  {
    product_id: 24,
    size_id: 50,
    sku: 'UQL-JNFL-W-BLU-S',
    barcode: '10000074',
    base_price: 899000,
    quantity: 20,
    status: true,
    attribute: {
      'chất liệu': 'denim',
      phom: 'flare wide',
      màu: 'blue',
    },
    tags: [
      'đi chơi',
      'dạo phố',
      'hẹn hò',
      'café',
      'du lịch',
      'casual',
      'retro',
      'vintage',
      'thời trang',
      'sự kiện',
      'concert',
      'picnic',
    ],
  },
  {
    product_id: 24,
    size_id: 51,
    sku: 'UQL-JNFL-W-BLU-M',
    barcode: '10000075',
    base_price: 899000,
    quantity: 18,
    status: true,
    attribute: {
      'chất liệu': 'denim',
      phom: 'flare wide',
      màu: 'blue',
    },
    tags: [
      'đi chơi',
      'dạo phố',
      'hẹn hò',
      'café',
      'du lịch',
      'casual',
      'retro',
      'vintage',
      'thời trang',
      'sự kiện',
      'concert',
      'picnic',
    ],
  },
  {
    product_id: 24,
    size_id: 52,
    sku: 'UQL-JNFL-W-BLU-L',
    barcode: '10000076',
    base_price: 899000,
    quantity: 16,
    status: true,
    attribute: {
      'chất liệu': 'denim',
      phom: 'flare wide',
      màu: 'blue',
    },
    tags: [
      'đi chơi',
      'dạo phố',
      'hẹn hò',
      'café',
      'du lịch',
      'casual',
      'retro',
      'vintage',
      'thời trang',
      'sự kiện',
      'concert',
      'picnic',
    ],
  },

  // 25) UNIQLO Quần Easy Shorts Vải Cotton | Hickory (Women) – shorts: S/M/L
  {
    product_id: 25,
    size_id: 50,
    sku: 'UQL-EZSH-W-PNK-S',
    barcode: '10000077',
    base_price: 399000,
    quantity: 32,
    status: true,
    attribute: {
      'chất liệu': 'cotton hickory',
      form: 'easy shorts',
      màu: 'pink',
    },
    tags: [
      'đi chơi',
      'dạo phố',
      'đi biển',
      'du lịch',
      'picnic',
      'mùa hè',
      'casual',
      'thoải mái',
      'café',
      'đi học',
      'weekend',
      'resort',
    ],
  },
  {
    product_id: 25,
    size_id: 51,
    sku: 'UQL-EZSH-W-PNK-M',
    barcode: '10000078',
    base_price: 399000,
    quantity: 28,
    status: true,
    attribute: {
      'chất liệu': 'cotton hickory',
      form: 'easy shorts',
      màu: 'pink',
    },
    tags: [
      'đi chơi',
      'dạo phố',
      'đi biển',
      'du lịch',
      'picnic',
      'mùa hè',
      'casual',
      'thoải mái',
      'café',
      'đi học',
      'weekend',
      'resort',
    ],
  },
  {
    product_id: 25,
    size_id: 52,
    sku: 'UQL-EZSH-W-PNK-L',
    barcode: '10000079',
    base_price: 399000,
    quantity: 24,
    status: true,
    attribute: {
      'chất liệu': 'cotton hickory',
      form: 'easy shorts',
      màu: 'pink',
    },
    tags: [
      'đi chơi',
      'dạo phố',
      'đi biển',
      'du lịch',
      'picnic',
      'mùa hè',
      'casual',
      'thoải mái',
      'café',
      'đi học',
      'weekend',
      'resort',
    ],
  },
];

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

// ---- EMBEDDING CALL ----
interface GeminiResponse {
  embedding?: {
    values: number[];
  };
}

async function embedText(text: string) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'text-embedding-004',
        content: {
          parts: [{ text }],
        },
      }),
    },
  );

  const data = (await res.json()) as GeminiResponse;

  if (!data.embedding?.values) {
    console.error('Gemini embedding failed:', data);
    throw new Error('Gemini embedding failed');
  }

  return data.embedding.values;
}

// ---- BUILD RICH CONTENT FOR VARIANT ----
function buildVariantContent(
  variant: product_variants,
  product: products,
  brand: brands,
  category: categories,
  size: sizes,
): string {
  const parts: string[] = [];

  // Tên sản phẩm
  parts.push(product.product_name);

  // Mô tả sản phẩm
  if (product.description) {
    parts.push(product.description);
  }

  // Thương hiệu
  if (brand?.brand_name) {
    parts.push(`Thương hiệu: ${brand.brand_name}`);
  }

  // Danh mục
  if (category?.category_name) {
    parts.push(`Danh mục: ${category.category_name}`);
  }

  // Size
  if (size?.size_label) {
    parts.push(
      `Size: ${size.size_label} phù hợp cho người có chiều cao khoảng ${size.height_range} đến ${size.height_range} cm, cân nặng ${size.weight_range} đến ${size.weight_range} kg.`,
    );
  }

  // Giá
  parts.push(`Giá: ${(+variant.base_price).toLocaleString('vi-VN')}đ`);

  // Attributes (màu, chất liệu, form, v.v.)
  if (variant.attribute && typeof variant.attribute === 'object') {
    const attrs = variant.attribute;

    // Màu
    if (attrs['màu']) {
      parts.push(`Màu: ${attrs['màu']}`);
    }

    // Chất liệu
    if (attrs['chất liệu']) {
      parts.push(`Chất liệu: ${attrs['chất liệu']}`);
    }

    // Form/Phom
    if (attrs['form']) {
      parts.push(`Form: ${attrs['form']}`);
    } else if (attrs['phom']) {
      parts.push(`Phom: ${attrs['phom']}`);
    }

    // Phong cách
    if (attrs['phong cách']) {
      parts.push(`Phong cách: ${attrs['phong cách']}`);
    }

    // Công nghệ
    if (attrs['công nghệ']) {
      parts.push(`Công nghệ: ${attrs['công nghệ']}`);
    }

    // Họa tiết
    if (attrs['họa tiết']) {
      parts.push(`Họa tiết: ${attrs['họa tiết']}`);
    }

    // Kiểu dáng
    if (attrs['kiểu dáng']) {
      parts.push(`Kiểu dáng: ${attrs['kiểu dáng']}`);
    } else if (attrs['kiểu']) {
      parts.push(`Kiểu: ${attrs['kiểu']}`);
    }

    // Tính năng
    if (attrs['tính năng']) {
      parts.push(`Tính năng: ${attrs['tính năng']}`);
    }

    // Logo
    if (attrs['logo']) {
      parts.push(`Logo: ${attrs['logo']}`);
    }

    // Graphic
    if (attrs['graphic']) {
      parts.push(`Họa tiết: ${attrs['graphic']}`);
    }

    // Thiết kế
    if (attrs['thiết kế']) {
      parts.push(`Thiết kế: ${attrs['thiết kế']}`);
    }

    // Độ dài
    if (attrs['độ dài']) {
      parts.push(`Độ dài: ${attrs['độ dài']}`);
    }

    // Co giãn
    if (attrs['co giãn']) {
      parts.push(`Co giãn: ${attrs['co giãn']}`);
    }

    // Lót
    if (attrs['lót']) {
      parts.push(`Lót: ${attrs['lót']}`);
    }
  }

  // ✨ NEW: Thêm tags vào content để embedding
  if (variant.tags && Array.isArray(variant.tags) && variant.tags.length > 0) {
    parts.push(`Phù hợp cho: ${variant.tags.join(', ')}`);
  }

  // Tình trạng kho
  if (variant.quantity > 0) {
    parts.push(`Còn hàng: ${variant.quantity} sản phẩm`);
  } else {
    parts.push('Hết hàng');
  }

  // SKU (để dễ tra cứu)
  parts.push(`Mã sản phẩm: ${variant.sku}`);

  return parts.join('. ');
}

// ---- UPSERT VECTOR ----
async function upsertVariantDocument(
  variant: product_variants,
  product: products,
  brand: brands,
  category: categories,
  size: sizes,
  embedding: number[],
) {
  const content = buildVariantContent(variant, product, brand, category, size);

  const { error } = await supabase.from('documents').upsert(
    {
      source_id: variant.sku, // unique key: SKU
      content,
      metadata: {
        type: 'product_variant',
        variant_id: variant.variant_id,
        product_id: product.product_id,
        product_slug: product.slug,
        product_name: product.product_name,
        sku: variant.sku,
        barcode: variant.barcode,

        // Brand & Category
        brand_name: brand?.brand_name,
        category_name: category?.category_name,

        // Size
        size_id: size?.size_id,
        size_name: size?.size_label,

        // Price & Stock
        price: variant.base_price,
        quantity: variant.quantity,
        in_stock: variant.quantity > 0,
        status: variant.status,

        // Attributes (để filter)
        ...(variant.attribute && {
          color: (variant.attribute as any)['màu'],
          material: (variant.attribute as any)['chất liệu'],
          form: (variant.attribute as any)['form'] || (variant.attribute as any)['phom'],
          technology: (variant.attribute as any)['công nghệ'],
          pattern: (variant.attribute as any)['họa tiết'],
          style: (variant.attribute as any)['phong cách'],
        }),

        // ✨ NEW: Lưu tags vào metadata để có thể filter
        tags: variant.tags || [],
      },
      embedding,
      source_table: 'product_variants',
    },
    { onConflict: 'source_id' },
  );

  if (error) {
    console.error(`❌ Supabase error on ${variant.sku}`, error);
  } else {
    console.log(`✅ Vector upserted: ${variant.sku}`);
  }
}

// ---- MAIN SEED FUNCTION ----
export async function seedProductVariants(prisma: PrismaClient) {
  console.log('📦 Seeding local DB products...');
  await prisma.product_variants.createMany({
    data: variantsData,
    skipDuplicates: true,
  });

  console.log('🧠 Syncing product variants to Supabase Vector...');
  // Lấy tất cả variants với đầy đủ relations
  const variants = await prisma.product_variants.findMany({
    include: {
      products: {
        include: {
          brands: true,
          categories: true,
        },
      },
      sizes: true,
    },
  });

  console.log(`📦 Found ${variants.length} variants to process`);

  for (const variant of variants) {
    // Skip nếu không có product (data lỗi)
    if (!variant.products) {
      console.log(`⚠️ Skip variant ${variant.sku}: no product relation`);
      continue;
    }

    // Check exists
    const { data: exists } = await supabase
      .from('documents')
      .select('source_id')
      .eq('source_id', variant.sku)
      .maybeSingle();

    if (exists) {
      console.log(`⏭️ Skip exists: ${variant.sku}`);
      continue;
    }

    // Build content và embed
    const content = buildVariantContent(
      variant,
      variant.products,
      variant.products.brands,
      variant.products.categories,
      variant.sizes,
    );

    const embedding = await embedText(content);

    await upsertVariantDocument(
      variant,
      variant.products,
      variant.products.brands,
      variant.products.categories,
      variant.sizes,
      embedding,
    );

    // Rate limiting: đợi 100ms giữa mỗi request
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log('🎉 Product variants seed & embedding DONE!');
}
