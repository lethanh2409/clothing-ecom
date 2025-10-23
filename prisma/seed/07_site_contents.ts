import type { PrismaClient } from '@prisma/client';

// ---- DATASET ----
const siteContentsData = [
  {
    slug: 'faq-shipping-time',
    title: 'Thời gian giao hàng bao lâu?',
    content: 'null',
    category: 'FAQ',
    tags: ['giao-hang', 'shipping', 'thoi-gian'],
    status: true,
  },
  {
    slug: 'policy-data-security',
    title: 'Chính sách bảo mật dữ liệu',
    content: 'null',
    category: 'POLICY',
    tags: ['bao-mat', 'data-security', 'privacy'],
    status: true,
  },
  // … thêm tùy ý …
];

// ---- SEED ----
export async function seedSiteContents(prisma: PrismaClient) {
  console.log('📄 Seeding site_contents…');
  await prisma.site_contents.createMany({ data: siteContentsData, skipDuplicates: true }); // cần unique site_contents.slug
}
