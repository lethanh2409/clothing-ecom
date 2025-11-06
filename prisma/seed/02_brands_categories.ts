import type { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

// ========== GEMINI EMBEDDING ==========
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

// ========== UPSERT HELPER ==========
async function upsertDocument(
  sourceId: string,
  content: string,
  metadata: any,
  sourceTable: string,
) {
  const embedding = await embedText(content);
  const { error } = await supabase.from('documents').upsert(
    {
      source_id: sourceId,
      content,
      metadata,
      embedding,
      source_table: sourceTable,
    },
    { onConflict: 'source_id' },
  );

  if (error) {
    console.error(`❌ Supabase error on ${sourceId}`, error);
  } else {
    console.log(`✅ Vector upserted: ${sourceId}`);
  }
}

// ========== BRANDS DATA ==========
const brandsData = [
  {
    id: 1,
    name: 'Adidas',
    slug: 'adidas',
    desc: 'Thương hiệu thể thao quốc tế nổi tiếng với 3 sọc đặc trưng. Chuyên về giày dép, quần áo thể thao chất lượng cao.',
  },
  {
    id: 2,
    name: 'Nike',
    slug: 'nike',
    desc: 'Just Do It - Thương hiệu thể thao hàng đầu thế giới. Sản phẩm đa dạng từ giày chạy bộ, áo thun, đến phụ kiện thể thao.',
  },
  {
    id: 3,
    name: 'Uniqlo',
    slug: 'uniqlo',
    desc: 'Thời trang Nhật Bản với thiết kế tối giản, chất liệu cao cấp. Nổi tiếng với áo chống nắng AIRism và áo khoác lông vũ.',
  },
];

// ========== CATEGORIES DATA ==========
const categoriesData = [
  {
    category_id: 1,
    category_name: 'Đồ nam',
    slug: 'do-nam',
    description: 'Tất cả sản phẩm thời trang dành cho nam giới',
    parent_id: null,
  },
  {
    category_id: 2,
    category_name: 'Đồ nữ',
    slug: 'do-nu',
    description: 'Tất cả sản phẩm thời trang dành cho nữ giới',
    parent_id: null,
  },
  {
    category_id: 3,
    category_name: 'Áo thun nam',
    slug: 'ao-thun-nam',
    description: 'T-shirt nam, áo phông cotton thoáng mát',
    parent_id: 1,
  },
  {
    category_id: 4,
    category_name: 'Áo sơ mi nam',
    slug: 'ao-so-mi-nam',
    description: 'Shirt formal, áo sơ mi công sở và casual',
    parent_id: 1,
  },
  {
    category_id: 5,
    category_name: 'Áo polo nam',
    slug: 'ao-polo-nam',
    description: 'Polo shirt, áo thể thao có cổ thanh lịch',
    parent_id: 1,
  },
  {
    category_id: 6,
    category_name: 'Quần short nam',
    slug: 'quan-short-nam',
    description: 'Quần ngắn mùa hè, summer shorts thể thao',
    parent_id: 1,
  },
  {
    category_id: 7,
    category_name: 'Quần dài nam',
    slug: 'quan-dai-nam',
    description: 'Jeans, chinos, quần tây, trousers',
    parent_id: 1,
  },
  {
    category_id: 16,
    category_name: 'Áo khoác nam',
    slug: 'ao-khoac-nam',
    description: 'Jacket, coat, áo khoác gió, hoodie nam',
    parent_id: 1,
  },

  {
    category_id: 8,
    category_name: 'Áo thun nữ',
    slug: 'ao-thun-nu',
    description: 'T-shirt nữ, áo phông form rộng và ôm',
    parent_id: 2,
  },
  {
    category_id: 9,
    category_name: 'Áo sơ mi nữ',
    slug: 'ao-so-mi-nu',
    description: 'Shirt nữ công sở và dạo phố',
    parent_id: 2,
  },
  {
    category_id: 10,
    category_name: 'Áo khoác nữ',
    slug: 'ao-khoac-nu',
    description: 'Jacket, coat, áo khoác da, áo dạ nữ',
    parent_id: 2,
  },
  {
    category_id: 11,
    category_name: 'Quần short nữ',
    slug: 'quan-short-nu',
    description: 'Quần ngắn nữ, summer shorts',
    parent_id: 2,
  },
  {
    category_id: 12,
    category_name: 'Quần dài nữ',
    slug: 'quan-dai-nu',
    description: 'Jeans, chinos, quần ống rộng, trousers nữ',
    parent_id: 2,
  },
  {
    category_id: 13,
    category_name: 'Áo tank top',
    slug: 'ao-tank-top',
    description: 'Áo hai dây, tank top thể thao nữ',
    parent_id: 2,
  },
  {
    category_id: 14,
    category_name: 'Váy ngắn',
    slug: 'vay-ngan',
    description: 'Váy ngắn dạo phố, váy chữ A',
    parent_id: 2,
  },
  {
    category_id: 15,
    category_name: 'Quần legging',
    slug: 'quan-legging',
    description: 'Quần legging tập gym, yoga nữ',
    parent_id: 2,
  },
  {
    category_id: 17,
    category_name: 'Áo khoác hoodie nữ',
    slug: 'ao-khoac-hoodie-nu',
    description: 'Áo hoodie có mũ, áo nỉ nữ',
    parent_id: 2,
  },
  {
    category_id: 18,
    category_name: 'Quần jeans nữ',
    slug: 'quan-jeans-nu',
    description: 'Quần bò nữ, jeans rách, skinny jeans',
    parent_id: 2,
  },
];

// ========== SEED BRANDS ==========
export async function seedBrands(prisma: PrismaClient) {
  console.log('🏷️  Seeding local DB brands...');
  await prisma.brands.createMany({
    data: brandsData.map((b) => ({
      brand_name: b.name,
      slug: b.slug,
      description: b.desc ?? null,
    })),
    skipDuplicates: true,
  });

  console.log('🧠 Syncing brands to Supabase Vector...');

  for (const brand of brandsData) {
    const { data: exists } = await supabase
      .from('documents')
      .select('source_id')
      .eq('source_id', `brand-${brand.slug}`)
      .maybeSingle();

    if (exists) {
      console.log(`⏭️ Skip exists: brand-${brand.slug}`);
      continue;
    }

    // Content chi tiết hơn để AI hiểu rõ
    const text = `Thương hiệu: ${brand.name}. ${brand.desc}. Slug: ${brand.slug}. Khách hàng có thể tìm các sản phẩm của ${brand.name} bằng cách lọc theo brand hoặc tìm kiếm trực tiếp tên thương hiệu.`;

    await upsertDocument(
      `brand-${brand.slug}`,
      text,
      {
        type: 'brand',
        brand_id: brand.id,
        brand_name: brand.name,
        slug: brand.slug,
      },
      'brands',
    );
  }

  console.log('🎉 Brands seed & embedding DONE!');
}

// ========== SEED CATEGORIES ==========
export async function seedCategories(prisma: PrismaClient) {
  console.log('📂 Seeding local DB categories...');
  await prisma.categories.createMany({
    data: categoriesData,
    skipDuplicates: true,
  });

  console.log('🧠 Syncing categories to Supabase Vector...');

  for (const cat of categoriesData) {
    const { data: exists } = await supabase
      .from('documents')
      .select('source_id')
      .eq('source_id', `category-${cat.slug}`)
      .maybeSingle();

    if (exists) {
      console.log(`⏭️ Skip exists: category-${cat.slug}`);
      continue;
    }

    // Xác định gender từ parent
    const gender = cat.parent_id === 1 ? 'nam' : cat.parent_id === 2 ? 'nữ' : 'unisex';

    // Content phong phú hơn
    const parentName = cat.parent_id
      ? categoriesData.find((c) => c.category_id === cat.parent_id)?.category_name
      : null;

    const text = `Danh mục sản phẩm: ${cat.category_name}. Mô tả: ${cat.description}. ${parentName ? `Thuộc nhóm: ${parentName}.` : ''} Dành cho: ${gender}. Slug: ${cat.slug}. Khách có thể tìm ${cat.category_name} trong mục ${parentName || 'chính'}.`;

    await upsertDocument(
      `category-${cat.slug}`,
      text,
      {
        type: 'category',
        category_id: cat.category_id,
        category_name: cat.category_name,
        slug: cat.slug,
        parent_id: cat.parent_id,
        gender: gender,
      },
      'categories',
    );
  }

  console.log('🎉 Categories seed & embedding DONE!');
}
