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

// ========== BUILD RICH CONTENT FOR SITE CONTENT ==========
function buildSiteContentText(sc: {
  // những field bắt buộc từ nguồn dữ liệu của bạn
  slug: string;
  title: string;
  content: string;
  category?: string | null;
  tags?: string[]; // optional nếu có thể rỗng
  status?: boolean;
  // optional: nếu bạn có author khi sync
  updated_by?: number | null;
  // optional timestamps nếu muốn override
  created_at?: Date;
  updated_at?: Date;
}): string {
  const parts: string[] = [];

  // Tiêu đề
  parts.push(sc.title);

  // Nội dung chính
  parts.push(sc.content);

  // Thêm category vào content để semantic search tốt hơn
  if (sc.category) {
    const categoryMap: Record<string, string> = {
      FAQ: 'Câu hỏi thường gặp',
      POLICY: 'Chính sách',
      GUIDE: 'Hướng dẫn',
      ABOUT: 'Giới thiệu',
      CONTACT: 'Liên hệ',
    };
    const categoryText = categoryMap[sc.category] || sc.category;
    parts.push(`Thuộc mục: ${categoryText}`);
  }

  // Thêm tags để tăng khả năng match
  if (sc.tags && sc.tags.length > 0) {
    parts.push(`Từ khóa: ${sc.tags.join(', ')}`);
  }

  return parts.join('. ');
}

// ========== UPSERT HELPER ==========
async function upsertSiteContentDocument(sc: {
  // những field bắt buộc từ nguồn dữ liệu của bạn
  slug: string;
  title: string;
  content: string;
  category?: string | null;
  tags?: string[]; // optional nếu có thể rỗng
  status?: boolean;
  // optional: nếu bạn có author khi sync
  updated_by?: number | null;
  // optional timestamps nếu muốn override
  created_at?: Date;
  updated_at?: Date;
}) {
  const content = buildSiteContentText(sc);
  const embedding = await embedText(content);

  // Map category sang tiếng Việt cho metadata
  const categoryMap: Record<string, string> = {
    FAQ: 'Câu hỏi thường gặp',
    POLICY: 'Chính sách',
    GUIDE: 'Hướng dẫn',
    ABOUT: 'Giới thiệu',
    CONTACT: 'Liên hệ',
    unknown: 'Khác',
  };

  const { error } = await supabase.from('documents').upsert(
    {
      source_id: sc.slug,
      content,
      metadata: {
        type: 'site_content',
        slug: sc.slug,
        title: sc.title,
        category: sc.category,
        category_name: categoryMap[String(sc.category) || 'unknown'] || sc.category,
        tags: sc.tags,
        status: sc.status,

        // Thêm các flag để dễ filter
        is_faq: sc.category === 'FAQ',
        is_policy: sc.category === 'POLICY',
        is_guide: sc.category === 'GUIDE',
        is_about: sc.category === 'ABOUT',
        is_contact: sc.category === 'CONTACT',

        // Phân loại chi tiết theo tags
        is_shipping: sc.tags?.includes('giao-hang') || sc.tags?.includes('shipping'),
        is_payment: sc.tags?.includes('thanh-toan') || sc.tags?.includes('payment'),
        is_return: sc.tags?.includes('doi-tra') || sc.tags?.includes('return'),
        is_warranty: sc.tags?.includes('bao-hanh') || sc.tags?.includes('warranty'),
        is_size_guide: sc.tags?.includes('size') || sc.tags?.includes('do-luong'),
        is_care_guide: sc.tags?.includes('bao-quan') || sc.tags?.includes('giat-ui'),
      },
      embedding,
      source_table: 'site_contents',
    },
    { onConflict: 'source_id' },
  );

  if (error) {
    console.error(`❌ Supabase error on ${sc.slug}`, error);
  } else {
    console.log(`✅ Vector upserted: ${sc.slug}`);
  }
}

// ========== SITE CONTENTS DATA ==========
const siteContentsData = [
  {
    slug: 'faq-shipping-time',
    title: 'Thời gian giao hàng bao lâu?',
    content:
      'Đơn hàng trong nội thành Hà Nội và TP.HCM sẽ được giao trong vòng 1-2 ngày làm việc. Đối với các tỉnh thành khác, thời gian giao hàng từ 2-4 ngày làm việc tùy theo khoảng cách địa lý.',
    category: 'FAQ',
    tags: ['giao-hang', 'shipping', 'thoi-gian'],
    status: true,
  },
  {
    slug: 'faq-payment-methods',
    title: 'Các phương thức thanh toán được chấp nhận?',
    content:
      'Chúng tôi chấp nhận thanh toán qua: Tiền mặt khi nhận hàng (COD), Chuyển khoản ngân hàng, Thẻ tín dụng/ghi nợ (Visa, Mastercard), Ví điện tử (MoMo, ZaloPay, VNPay).',
    category: 'FAQ',
    tags: ['thanh-toan', 'payment', 'phuong-thuc'],
    status: true,
  },
  {
    slug: 'faq-return-policy',
    title: 'Chính sách đổi trả như thế nào?',
    content:
      'Quý khách có thể đổi/trả sản phẩm trong vòng 30 ngày kể từ ngày mua hàng. Sản phẩm phải còn nguyên tem mác, chưa qua sử dụng và giặt. Vui lòng mang theo hóa đơn khi đến cửa hàng hoặc liên hệ hotline để được hỗ trợ.',
    category: 'FAQ',
    tags: ['doi-tra', 'return', 'chinh-sach'],
    status: true,
  },
  {
    slug: 'faq-warranty',
    title: 'Sản phẩm có được bảo hành không?',
    content:
      'Tất cả sản phẩm được bảo hành 6 tháng đối với lỗi từ nhà sản xuất. Không bảo hành cho các trường hợp: Rách, phai màu do sử dụng, giặt không đúng cách, hoặc hư hỏng do tác động bên ngoài.',
    category: 'FAQ',
    tags: ['bao-hanh', 'warranty', 'loi-san-xuat'],
    status: true,
  },
  {
    slug: 'faq-size-guide',
    title: 'Làm sao để chọn size phù hợp?',
    content:
      'Chúng tôi có bảng size chi tiết cho từng thương hiệu. Bạn có thể đo số đo cơ thể (vòng ngực, vòng eo, vòng hông) và đối chiếu với bảng size. Nếu cần hỗ trợ, vui lòng chat với tư vấn viên hoặc gọi hotline.',
    category: 'FAQ',
    tags: ['size', 'huong-dan', 'do-luong'],
    status: true,
  },
  {
    slug: 'policy-data-security',
    title: 'Chính sách bảo mật dữ liệu',
    content:
      'Chúng tôi cam kết bảo vệ thông tin cá nhân của khách hàng theo quy định pháp luật hiện hành. Thông tin của bạn chỉ được sử dụng cho mục đích xử lý đơn hàng và không chia sẻ cho bên thứ ba mà không có sự đồng ý.',
    category: 'POLICY',
    tags: ['bao-mat', 'data-security', 'privacy'],
    status: true,
  },
  {
    slug: 'policy-terms-of-service',
    title: 'Điều khoản sử dụng dịch vụ',
    content:
      'Khi sử dụng website và dịch vụ của chúng tôi, bạn đồng ý tuân thủ các điều khoản và điều kiện được quy định. Chúng tôi có quyền từ chối phục vụ hoặc hủy đơn hàng nếu phát hiện hành vi gian lận.',
    category: 'POLICY',
    tags: ['dieu-khoan', 'terms', 'service'],
    status: true,
  },
  {
    slug: 'guide-care-cotton',
    title: 'Cách bảo quản đồ cotton',
    content:
      'Đồ cotton nên giặt bằng nước lạnh hoặc ấm (dưới 40°C), tránh giặt chung với đồ có màu đậm lần đầu. Phơi ngược mặt trong để tránh phai màu. Là ở nhiệt độ trung bình.',
    category: 'GUIDE',
    tags: ['bao-quan', 'cotton', 'giat-ui'],
    status: true,
  },
  {
    slug: 'guide-care-polyester',
    title: 'Cách bảo quản đồ polyester',
    content:
      'Polyester có thể giặt máy ở chế độ nhẹ, nhiệt độ không quá 60°C. Không dùng chất tẩy trắng. Phơi khô tự nhiên hoặc sấy ở nhiệt độ thấp. Ít cần là vì ít bị nhăn.',
    category: 'GUIDE',
    tags: ['bao-quan', 'polyester', 'the-thao'],
    status: true,
  },
  {
    slug: 'guide-measure-body',
    title: 'Hướng dẫn đo số đo cơ thể',
    content:
      'Vòng ngực: Đo qua điểm cao nhất của ngực. Vòng eo: Đo qua phần nhỏ nhất của eo. Vòng hông: Đo qua phần lớn nhất của hông. Chiều dài áo: Từ vai đến gấu áo. Sử dụng thước dây mềm và đo sát cơ thể.',
    category: 'GUIDE',
    tags: ['do-luong', 'body-measurement', 'size'],
    status: true,
  },
  {
    slug: 'about-us',
    title: 'Về chúng tôi',
    content:
      'Chúng tôi là cửa hàng thời trang chuyên cung cấp các sản phẩm chất lượng từ các thương hiệu nổi tiếng như Adidas, Nike, Uniqlo. Với cam kết mang đến trải nghiệm mua sắm tốt nhất cho khách hàng.',
    category: 'ABOUT',
    tags: ['gioi-thieu', 'about', 'thuong-hieu'],
    status: true,
  },
  {
    slug: 'contact-info',
    title: 'Thông tin liên hệ',
    content:
      'Hotline: 1900-xxxx. Email: support@store.com. Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM. Giờ làm việc: 8:00 - 22:00 tất cả các ngày trong tuần.',
    category: 'CONTACT',
    tags: ['lien-he', 'contact', 'hotline'],
    status: true,
  },
];

// ========== SEED SITE CONTENTS ==========
export async function seedSiteContents(prisma: PrismaClient) {
  console.log('📄 Seeding local DB site_contents...');
  await prisma.site_contents.createMany({
    data: siteContentsData,
    skipDuplicates: true,
  });

  console.log('🧠 Syncing site_contents to Supabase Vector...');

  for (const sc of siteContentsData) {
    const { data: exists } = await supabase
      .from('documents')
      .select('source_id')
      .eq('source_id', sc.slug)
      .maybeSingle();

    if (exists) {
      console.log(`⏭️ Skip exists: ${sc.slug}`);
      continue;
    }

    await upsertSiteContentDocument(sc);

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log('🎉 Site contents seed & embedding DONE!');
}
