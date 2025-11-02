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
  { name: 'Adidas', slug: 'adidas', desc: 'Thương hiệu thể thao quốc tế' },
  { name: 'Nike', slug: 'nike', desc: 'Just Do It - Thể thao hàng đầu' },
  { name: 'Uniqlo', slug: 'uniqlo', desc: 'Thời trang Nhật Bản' },
];

// ========== CATEGORIES DATA ==========
const categoriesData = [
  { category_name: 'Đồ nam', slug: 'do-nam', description: 'Danh mục đồ nam', parent_id: null },
  { category_name: 'Đồ nữ', slug: 'do-nu', description: 'Danh mục đồ nữ', parent_id: null },
  { category_name: 'Áo thun nam', slug: 'ao-thun-nam', description: 'T-shirt', parent_id: 1 },
  {
    category_name: 'Áo sơ mi nam',
    slug: 'ao-so-mi-nam',
    description: 'Shirt formal, casual',
    parent_id: 1,
  },
  {
    category_name: 'Áo polo nam',
    slug: 'ao-polo-nam',
    description: 'Polo shirt, casual',
    parent_id: 1,
  },
  {
    category_name: 'Quần short nam',
    slug: 'quan-short-nam',
    description: 'Summer shorts',
    parent_id: 1,
  },
  {
    category_name: 'Quần dài nam',
    slug: 'quan-dai-nam',
    description: 'Jeans, chinos, trousers',
    parent_id: 1,
  },
  { category_name: 'Áo thun nữ', slug: 'ao-thun-nu', description: 'T-shirt', parent_id: 2 },
  {
    category_name: 'Áo sơ mi nữ',
    slug: 'ao-so-mi-nu',
    description: 'Shirt formal, casual',
    parent_id: 2,
  },
  { category_name: 'Áo khoác nữ', slug: 'ao-khoac-nu', description: 'Jacket, coat', parent_id: 2 },
  {
    category_name: 'Quần short nữ',
    slug: 'quan-short-nu',
    description: 'Summer shorts',
    parent_id: 2,
  },
  {
    category_name: 'Quần dài nữ',
    slug: 'quan-dai-nu',
    description: 'Jeans, chinos, trousers',
    parent_id: 2,
  },
  {
    category_name: 'Áo tank top',
    slug: 'ao-tank-top',
    description: 'áo tank top nữ',
    parent_id: 2,
  },
  { category_name: 'Váy ngắn', slug: 'vay-ngan', description: 'Váy ngắn nữ', parent_id: 2 },
  {
    category_name: 'Quần legging',
    slug: 'quan-legging',
    description: 'Quần legging nữ',
    parent_id: 2,
  },
  {
    category_name: 'Áo khoác nam',
    slug: 'ao-khoac-nam',
    description: 'Jacket, coat',
    parent_id: 1,
  },
  {
    category_name: 'Áo khoác hoodie nữ',
    slug: 'ao-khoac-hoodie-nu',
    description: 'Áo khoác hoodie nữ',
    parent_id: 2,
  },
  {
    category_name: 'Quần jeans nữ',
    slug: 'quan-jeans-nu',
    description: 'Quần jeans nữ',
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
      .eq('source_id', brand.slug)
      .maybeSingle();

    if (exists) {
      console.log(`⏭️ Skip exists: ${brand.slug}`);
      continue;
    }

    const text = `${brand.name}. ${brand.desc}`;
    await upsertDocument(brand.slug, text, { type: 'brand' }, 'brands');
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
      .eq('source_id', cat.slug)
      .maybeSingle();

    if (exists) {
      console.log(`⏭️ Skip exists: ${cat.slug}`);
      continue;
    }

    const text = `${cat.category_name}. ${cat.description}`;
    await upsertDocument(
      cat.slug,
      text,
      {
        parent_id: cat.parent_id,
        type: 'category',
      },
      'categories',
    );
  }

  console.log('🎉 Categories seed & embedding DONE!');
}
