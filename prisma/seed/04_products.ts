import type { PrismaClient } from '@prisma/client';
//import { createClient } from '@supabase/supabase-js';

// ---- DATASET ----
const productsData = [
  {
    // ADIDAS
    product_name: 'Adidas Adicolor Jacquard Jersey',
    slug: 'adidas-adicolor-jacquard-jersey',
    description: 'Áo thun nam Adidas Adicolor chất liệu cotton thoáng mát',
    brand_id: 1,
    category_id: 3,
  },
  {
    product_name: 'Originals Twistknit Trefoil Polo Shirt',
    slug: 'originals-twistknit-trefoil-polo-shirt',
    description: 'Áo polo nam Originals Twistknit với họa tiết Trefoil đặc trưng',
    brand_id: 1,
    category_id: 5,
  },
  {
    product_name: 'Twistweave Pinstripe Ankle Pants',
    slug: 'twistweave-pinstripe-ankle-pants',
    description: 'Quần dài nam Twistweave với họa tiết kẻ sọc thanh lịch',
    brand_id: 1,
    category_id: 7,
  },
  {
    product_name: 'Z.N.E. Shorts',
    slug: 'z-n-e-shorts',
    description: 'Quần short thể thao Z.N.E. với thiết kế thoải mái',
    brand_id: 1,
    category_id: 6,
  },
  {
    product_name: 'Essentials 3-Stripes Cotton Tee',
    slug: 'essentials-3-stripes-cotton-tee',
    description: 'Áo thun nữ Essentials với 3 sọc đặc trưng của Adidas',
    brand_id: 1,
    category_id: 8,
  },
  {
    product_name: 'Essentials Small Logo Cotton Lifestyle Tank Top',
    slug: 'essentials-small-logo-cotton-lifestyle-tank-top',
    description: 'Áo tank top nữ Essentials với logo nhỏ đặc trưng của Adidas',
    brand_id: 1,
    category_id: 13,
  },
  {
    product_name: 'Adidas All Me Rib 7/8 Leggings',
    slug: 'adidas-all-me-rib-7-8-leggings',
    description: 'Quần legging nữ adidas All Me Rib với thiết kế ôm sát và thoải mái',
    brand_id: 1,
    category_id: 15,
  },
  {
    product_name: 'Adidas Originals GFX Skirt',
    slug: 'adidas-originals-gfx-skirt',
    description: 'Chân váy nữ Adidas Originals GFX với thiết kế trẻ trung và năng động',
    brand_id: 1,
    category_id: 14,
  },

  // NIKE
  {
    product_name: 'Nike Dri-FIT Running T-Shirt',
    slug: 'men-dri-fit-running-t-shirt',
    description: 'Áo thun nam Nike Dri-FIT với công nghệ thoáng khí',
    brand_id: 2,
    category_id: 3,
  },
  {
    product_name: 'Nike Heavyweight Polo',
    slug: 'nike-heavyweight-polo',
    description: 'Áo polo nam Nike Heavyweight với chất liệu dày dạn và thoải mái',
    brand_id: 2,
    category_id: 5,
  },
  {
    product_name: 'Nike Stride Repel UV Running Jacket',
    slug: 'nike-stride-repel-uv-running-jacket',
    description: 'Áo khoác nam Nike Stride Repel UV với công nghệ chống tia UV',
    brand_id: 2,
    category_id: 16,
  },
  {
    product_name: 'Nike Dri-FIT Victory Golf Trousers',
    slug: 'nike-dri-fit-victory-golf-trousers',
    description: 'Quần dài nam Nike Dri-FIT Victory Golf với công nghệ thoáng khí',
    brand_id: 2,
    category_id: 7,
  },
  {
    product_name: 'Nike Dri-FIT Challenger Brief-Lined Versatile Shorts',
    slug: 'nike-dri-fit-challenger-brief-lined-versatile-shorts',
    description: 'Quần short nam Nike Dri-FIT Challenger với lớp lót thoải mái',
    brand_id: 2,
    category_id: 6,
  },
  {
    product_name: 'Just Do It: Nike Basketball T-Shirt',
    slug: 'just-do-it-nike-basketball-t-shirt',
    description: 'Áo thun nữ Nike Basketball với họa tiết Just Do It đặc trưng',
    brand_id: 2,
    category_id: 8,
  },
  {
    product_name: 'Nike Sportswear Windrunner Jacket',
    slug: 'nike-sportswear-windrunner-jacket',
    description: 'Áo khoác nữ Nike Sportswear Windrunner với thiết kế năng động và thoải mái',
    brand_id: 2,
    category_id: 10,
  },
  {
    product_name: 'NikeCourt Advantage Dri-FIT Skirt',
    slug: 'nikecourt-advantage-dri-fit-skirt',
    description: 'Chân váy tennis nữ NikeCourt Advantage Dri-FIT với công nghệ thoáng khí',
    brand_id: 2,
    category_id: 14,
  },
  {
    product_name: 'Nike High-Waisted Loose Wide-Leg Trousers',
    slug: 'nike-high-waisted-loose-wide-leg-trousers',
    description: 'Quần dài nữ Nike High-Waisted với thiết kế thoải mái và phong cách',
    brand_id: 2,
    category_id: 12,
  },

  // UNIQLO
  {
    product_name: 'UNIQLO Áo Thun Milano Vải Gân',
    slug: 'uniqlo-ao-thun-milano-vai-gan',
    description: 'Áo thun nam UNIQLO chất liệu Milano vải gân thoáng mát',
    brand_id: 3,
    category_id: 3,
  },
  {
    product_name: 'UNIQLO Áo Sơ Mi Vải Dạ | Caro',
    slug: 'uniqlo-ao-so-mi-vai-da-caro',
    description: 'Áo sơ mi nam UNIQLO chất liệu vải dạ họa tiết caro thời trang',
    brand_id: 3,
    category_id: 4,
  },
  {
    product_name: 'UNIQLO Quần Jeans Dáng Rộng Ống Suông',
    slug: 'uniqlo-quan-jeans-dang-rong-ong-suong',
    description: 'Quần dài nam UNIQLO Jeans dáng rộng ống suông thoải mái',
    brand_id: 3,
    category_id: 7,
  },
  {
    product_name: 'UNIQLO Quần Short Vải Jersey',
    slug: 'uniqlo-quan-short-vai-jersey',
    description: 'Quần short nam UNIQLO chất liệu jersey thoáng mát',
    brand_id: 3,
    category_id: 6,
  },
  {
    product_name: 'UNIQLO Áo Thun AIRism Cotton',
    slug: 'uniqlo-ao-thun-airism-cotton',
    description: 'Áo thun nữ UNIQLO AIRism Cotton với chất liệu thoáng mát',
    brand_id: 3,
    category_id: 8,
  },
  {
    product_name: 'UNIQLO Áo Hoodie Nỉ Dry Kéo Khóa',
    slug: 'uniqlo-ao-hoodie-ni-dry-keo-khoa',
    description: 'Áo hoodie nữ UNIQLO với chất liệu nỉ mềm mại và khả năng giữ ấm tốt',
    brand_id: 3,
    category_id: 17,
  },
  {
    product_name: 'UNIQLO Quần Jeans Ống Loe Rộng Dáng Rũ',
    slug: 'uniqlo-quan-jeans-ong-loe-rong-dang-ru',
    description: 'Quần jeans nữ UNIQLO ống loe rộng dáng rũ với chất liệu thoáng mát',
    brand_id: 3,
    category_id: 18,
  },
  {
    product_name: 'UNIQLO Quần Easy Shorts Vải Cotton | Hickory',
    slug: 'uniqlo-quan-easy-shorts-vai-cotton-hickory',
    description: 'Quần short nữ UNIQLO Easy Shorts với chất liệu cotton thoáng mát',
    brand_id: 3,
    category_id: 11,
  },
];

// const supabase = createClient(
//   process.env.SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_KEY!, // phải là service key để upsert
// );

// // ---- EMBEDDING CALL ----
// interface GeminiResponse {
//   embedding?: {
//     values: number[];
//   };
// }

// async function embedText(text: string) {
//   const res = await fetch(
//     `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GEMINI_API_KEY}`,
//     {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         model: 'text-embedding-004',
//         content: {
//           parts: [{ text }],
//         },
//       }),
//     },
//   );

//   const data = (await res.json()) as GeminiResponse;

//   if (!data.embedding?.values) {
//     console.error('Gemini embedding failed:', data);
//     throw new Error('Gemini embedding failed');
//   }

//   return data.embedding.values;
// }

// ---- UPSERT VECTOR ----
// async function upsertDocument(product, embedding) {
//   const { error } = await supabase.from('documents').upsert(
//     {
//       source_id: product.slug, // unique key
//       content: `${product.product_name}. ${product.description}`,
//       metadata: {
//         brand_id: product.brand_id,
//         category_id: product.category_id,
//         type: 'product',
//       },
//       embedding,
//       source_table: 'products',
//     },
//     { onConflict: 'source_id' },
//   );

//   if (error) {
//     console.error(`❌ Supabase error on ${product.slug}`, error);
//   } else {
//     console.log(`✅ Vector upserted: ${product.slug}`);
//   }
// }

// ---- MAIN SEED FUNCTION ----
export async function seedProducts(prisma: PrismaClient) {
  console.log('📦 Seeding local DB products...');
  await prisma.products.createMany({
    data: productsData,
    skipDuplicates: true,
  });

  // console.log('🧠 Syncing products to Supabase Vector...');

  // for (const product of productsData) {
  //   // check exists
  //   const { data: exists } = await supabase
  //     .from('documents')
  //     .select('source_id')
  //     .eq('source_id', product.slug)
  //     .maybeSingle();

  //   if (exists) {
  //     console.log(`⏭️ Skip exists: ${product.slug}`);
  //     continue;
  //   }

  //   const text = `${product.product_name}. ${product.description}`;
  //   const embedding = await embedText(text);
  //   await upsertDocument(product, embedding);
  // }

  console.log('🎉 Product seed & embedding DONE!');
}
