import type { PrismaClient } from '@prisma/client';

// ---- DATASET (đúng form bạn muốn) ----
const brandsData = [
  { name: 'Adidas', slug: 'adidas', desc: 'Thương hiệu thể thao quốc tế' },
  { name: 'Nike', slug: 'nike', desc: 'Just Do It - Thể thao hàng đầu' },
  { name: 'Uniqlo', slug: 'uniqlo', desc: 'Thời trang Nhật Bản' },
];

// ---- SEED (không find) ----
export async function seedBrands(prisma: PrismaClient) {
  console.log('🏷️  Seeding brands…');
  // giữ đúng “const data + 1 hàm push” – dùng createMany; cần unique brands.slug
  await prisma.brands.createMany({
    data: brandsData.map((b) => ({
      brand_name: b.name,
      slug: b.slug,
      description: b.desc ?? null,
    })),
    skipDuplicates: true,
  });
}

// parent_id điền tay; không đọc từ DB. Nếu chưa biết thì để null và cập nhật sau.
const categoriesData = [
  { category_name: 'Đồ nam', slug: 'do-nam', description: 'Danh mục đồ nam', parent_id: null },
  { category_name: 'Đồ nữ', slug: 'do-nu', description: 'Danh mục đồ nữ', parent_id: null },
  {
    category_name: 'Áo thun nam', //3
    slug: 'ao-thun-nam',
    description: 'T-shirt',
    parent_id: 1,
  },
  {
    category_name: 'Áo sơ mi nam', //4
    slug: 'ao-so-mi-nam',
    description: 'Shirt formal, casual',
    parent_id: 1,
  },
  {
    category_name: 'Áo polo nam', //5
    slug: 'ao-polo-nam',
    description: 'Polo shirt, casual',
    parent_id: 1,
  },
  {
    category_name: 'Quần short nam', //6
    slug: 'quan-short-nam',
    description: 'Summer shorts',
    parent_id: 1,
  },
  {
    category_name: 'Quần dài nam', //7
    slug: 'quan-dai-nam',
    description: 'Jeans, chinos, trousers',
    parent_id: 1,
  },
  {
    category_name: 'Áo thun nữ', //8
    slug: 'ao-thun-nu',
    description: 'T-shirt',
    parent_id: 2,
  },
  {
    category_name: 'Áo sơ mi nữ', //9
    slug: 'ao-so-mi-nu',
    description: 'Shirt formal, casual',
    parent_id: 2,
  },
  {
    category_name: 'Áo khoác nữ', //10
    slug: 'ao-khoac-nu',
    description: 'Jacket, coat',
    parent_id: 2,
  },
  {
    category_name: 'Quần short nữ', //11
    slug: 'quan-short-nu',
    description: 'Summer shorts',
    parent_id: 2,
  },
  {
    category_name: 'Quần dài nữ', //12
    slug: 'quan-dai-nu',
    description: 'Jeans, chinos, trousers',
    parent_id: 2,
  },
  {
    category_name: 'Áo tank top', //13
    slug: 'ao-tank-top',
    description: 'áo tank top nữ',
    parent_id: 2,
  },
  {
    category_name: 'Váy ngắn', //14
    slug: 'vay-ngan',
    description: 'Váy ngắn nữ',
    parent_id: 2,
  },
  {
    category_name: 'Quần legging', //15
    slug: 'quan-legging',
    description: 'Quần legging nữ',
    parent_id: 2,
  },
  {
    category_name: 'Áo khoác nam', //16
    slug: 'ao-khoac-nam',
    description: 'Jacket, coat',
    parent_id: 1,
  },
  {
    category_name: 'Áo khoác hoodie nữ', //17
    slug: 'ao-khoac-hoodie-nu',
    description: 'Áo khoác hoodie nữ',
    parent_id: 2,
  },
  {
    category_name: 'Quần jeans nữ', //18
    slug: 'quan-jeans-nu',
    description: 'Quần jeans nữ',
    parent_id: 2,
  },
];

// ---- SEED ----
export async function seedCategories(prisma: PrismaClient) {
  console.log('📂 Seeding categories…');
  await prisma.categories.createMany({ data: categoriesData, skipDuplicates: true });
}
