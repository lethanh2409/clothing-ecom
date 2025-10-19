import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ================================
  // 1. Roles
  // ================================
  console.log('📝 Seeding roles...');
  const adminRole = await prisma.roles.upsert({
    where: { role_name: 'ADMIN' },
    update: {},
    create: { role_name: 'ADMIN', description: 'Quản trị hệ thống' },
  });

  const staffRole = await prisma.roles.upsert({
    where: { role_name: 'STAFF' },
    update: {},
    create: { role_name: 'STAFF', description: 'Nhân viên vận hành' },
  });

  const customerRole = await prisma.roles.upsert({
    where: { role_name: 'CUSTOMER' },
    update: {},
    create: { role_name: 'CUSTOMER', description: 'Khách hàng' },
  });

  // ================================
  // 2. Users
  // ================================
  console.log('👤 Seeding users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.users.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      email: 'admin@demo.vn',
      phone: '0900000001',
      full_name: 'Quản Trị',
    },
  });

  const staff1 = await prisma.users.upsert({
    where: { username: 'staff1' },
    update: {},
    create: {
      username: 'staff1',
      password: hashedPassword,
      email: 'staff1@demo.vn',
      phone: '0900000002',
      full_name: 'Nhân Viên 1',
    },
  });

  const customers: any[] = [];
  for (let i = 1; i <= 5; i++) {
    const customer = await prisma.users.upsert({
      where: { username: `khach${i}` },
      update: {},
      create: {
        username: `khach${i}`,
        password: hashedPassword,
        email: `khach${i}@demo.vn`,
        phone: `090000000${i + 2}`,
        full_name: `Nguyễn Văn ${String.fromCharCode(64 + i)}`,
      },
    });
    customers.push(customer);
  }

  // ================================
  // 3. User Roles
  // ================================
  console.log('🔗 Mapping user roles...');
  await prisma.user_role.createMany({
    data: [
      { user_id: admin.user_id, role_id: adminRole.role_id },
      { user_id: admin.user_id, role_id: staffRole.role_id },
      { user_id: staff1.user_id, role_id: staffRole.role_id },
      ...customers.map((c) => ({ user_id: c.user_id, role_id: customerRole.role_id })),
    ],
    skipDuplicates: true,
  });

  // ================================
  // 4. Customers
  // ================================
  console.log('👥 Seeding customers...');
  const genders = ['male', 'female', 'male', 'male', 'female'];
  const customerRecords: any[] = [];

  for (let i = 0; i < customers.length; i++) {
    const customerRecord = await prisma.customers.upsert({
      where: { user_id: customers[i].user_id },
      update: {},
      create: {
        user_id: customers[i].user_id,
        birthday: new Date(1999 + i, 8 + i, 9 + i),
        gender: genders[i] as any,
      },
    });
    customerRecords.push(customerRecord);
  }

  // ================================
  // 5. Addresses
  // ================================
  console.log('📍 Seeding addresses...');
  const addressesData = [
    {
      customerIdx: 0,
      name: 'Nguyễn Văn A',
      phone: '0900000003',
      province: 'Thành phố Hồ Chí Minh',
      district: 'Quận 1',
      ward: 'Phường Bến Nghé',
      street: 'Lê Lợi',
      house: '12A',
      default: true,
    },
    {
      customerIdx: 0,
      name: 'Nguyễn Văn A',
      phone: '0900000003',
      province: 'Thành phố Hà Nội',
      district: 'Quận Hoàn Kiếm',
      ward: 'Phường Cửa Nam',
      street: 'Tràng Tiền',
      house: '22',
      default: false,
    },
    {
      customerIdx: 1,
      name: 'Lê Văn Z',
      phone: '0900000011',
      province: 'Thành phố Hồ Chí Minh',
      district: 'Quận Bình Thạnh',
      ward: 'Phường 17',
      street: 'Nguyễn Cửu Vân',
      house: '63',
      default: true,
    },
  ];

  for (const addr of addressesData) {
    await prisma.addresses.create({
      data: {
        customer_id: customerRecords[addr.customerIdx].customer_id,
        consignee_name: addr.name,
        consignee_phone: addr.phone,
        province: addr.province,
        district: addr.district,
        ward: addr.ward,
        street: addr.street,
        house_num: addr.house,
        is_default: addr.default,
      },
    });
  }

  // ================================
  // 6. Brands
  // ================================
  console.log('🏷️  Seeding brands...');
  const brandsData = [
    { name: 'Adidas', slug: 'adidas', desc: 'Thương hiệu thể thao quốc tế' },
    { name: 'Nike', slug: 'nike', desc: 'Just Do It - Thể thao hàng đầu' },
    { name: 'Uniqlo', slug: 'uniqlo', desc: 'Thời trang Nhật Bản' },
    { name: 'H&M', slug: 'h-m', desc: 'Fast fashion Sweden' },
    { name: 'Zara', slug: 'zara', desc: 'Thời trang Tây Ban Nha' },
    { name: 'Lacoste', slug: 'lacoste', desc: 'French sportswear elegance' },
    { name: 'The Bad Habit', slug: 'the-bad-habit', desc: 'Thương hiệu local brand' },
    { name: 'Ssstuter', slug: 'ssstuter', desc: 'Thương hiệu local brand' },
    { name: 'Degrey', slug: 'degrey', desc: 'Thương hiệu local brand' },
    { name: 'Coolmate', slug: 'coolmate', desc: 'Thương hiệu local brand' },
  ];

  const brands: any[] = [];
  for (const b of brandsData) {
    const brand = await prisma.brands.upsert({
      where: { slug: b.slug },
      update: {},
      create: { brand_name: b.name, slug: b.slug, description: b.desc },
    });
    brands.push(brand);
  }

  // ================================
  // 7. Sizes cho tất cả brands
  // ================================
  console.log('📏 Seeding sizes...');

  const adidasSizes = [
    {
      gender: 'male',
      label: 'S',
      height: '1m60–1m68',
      weight: '50–60kg',
      measurements: { chest: 50, shoulder: 46, length: 68 },
    },
    {
      gender: 'male',
      label: 'M',
      height: '1m68–1m75',
      weight: '60–70kg',
      measurements: { chest: 52, shoulder: 48, length: 70 },
    },
    {
      gender: 'male',
      label: 'L',
      height: '1m75–1m82',
      weight: '70–80kg',
      measurements: { chest: 54, shoulder: 50, length: 72 },
    },
    {
      gender: 'male',
      label: 'XL',
      height: '1m82–1m90',
      weight: '80–90kg',
      measurements: { chest: 56, shoulder: 52, length: 74 },
    },
    {
      gender: 'female',
      label: 'S',
      height: '1m50–1m58',
      weight: '40–50kg',
      measurements: { chest: 46, shoulder: 42, length: 64 },
    },
    {
      gender: 'female',
      label: 'M',
      height: '1m58–1m65',
      weight: '50–60kg',
      measurements: { chest: 48, shoulder: 44, length: 66 },
    },
    {
      gender: 'female',
      label: 'L',
      height: '1m65–1m72',
      weight: '60–70kg',
      measurements: { chest: 50, shoulder: 46, length: 68 },
    },
    {
      gender: 'female',
      label: 'XL',
      height: '1m72–1m80',
      weight: '70–80kg',
      measurements: { chest: 52, shoulder: 48, length: 70 },
    },
  ];

  for (const size of adidasSizes) {
    await prisma.sizes.create({
      data: {
        brand_id: brands[0].brand_id,
        gender: size.gender,
        size_label: size.label,
        height_range: size.height,
        weight_range: size.weight,
        measurements: size.measurements,
      },
    });
  }

  // ================================
  // 8. Categories
  // ================================
  console.log('📂 Seeding categories...');
  const catDoNam = await prisma.categories.create({
    data: { category_name: 'Đồ nam', slug: 'do-nam', description: 'Danh mục đồ nam' },
  });

  const catDoNu = await prisma.categories.create({
    data: { category_name: 'Đồ nữ', slug: 'do-nu', description: 'Danh mục đồ nữ' },
  });

  await prisma.categories.createMany({
    data: [
      {
        category_name: 'Áo thun nam',
        slug: 'ao-thun-nam',
        description: 'T-shirt, tank top',
        parent_id: catDoNam.category_id,
      },
      {
        category_name: 'Áo sơ mi nam',
        slug: 'ao-so-mi-nam',
        description: 'Shirt formal, casual',
        parent_id: catDoNam.category_id,
      },
      {
        category_name: 'Quần short nam',
        slug: 'quan-short-nam',
        description: 'Summer shorts',
        parent_id: catDoNam.category_id,
      },
      {
        category_name: 'Áo thun nữ',
        slug: 'ao-thun-nu',
        description: 'T-shirt, tank top',
        parent_id: catDoNu.category_id,
      },
      {
        category_name: 'Áo sơ mi nữ',
        slug: 'ao-so-mi-nu',
        description: 'Shirt formal, casual',
        parent_id: catDoNu.category_id,
      },
      {
        category_name: 'Quần short nữ',
        slug: 'quan-short-nu',
        description: 'Summer shorts',
        parent_id: catDoNu.category_id,
      },
    ],
  });

  // ================================
  // 9. Products
  // ================================
  console.log('📦 Seeding products...');

  const categories = await prisma.categories.findMany();
  const catAoThunNam = categories.find((c) => c.slug === 'ao-thun-nam');
  const catAoThunNu = categories.find((c) => c.slug === 'ao-thun-nu');

  const prod1 = await prisma.products.create({
    data: {
      brand_id: brands[0].brand_id,
      category_id: catAoThunNu!.category_id,
      product_name: 'GFX SAIGON 2 TEE WM',
      slug: 'gfx-saigon-2-tee-wm',
      description: 'Áo thun nữ Adidas cao cấp',
    },
  });

  const prod2 = await prisma.products.create({
    data: {
      brand_id: brands[0].brand_id,
      category_id: catAoThunNam!.category_id,
      product_name: 'GFX SAIGON 2 TEE M',
      slug: 'gfx-saigon-2-tee-m',
      description: 'Áo thun nam Adidas cao cấp',
    },
  });

  // ================================
  // 10. Product Variants
  // ================================
  console.log('🏷️  Seeding product variants...');

  const adidasMaleSizes = await prisma.sizes.findMany({
    where: { brand_id: brands[0].brand_id, gender: 'male' },
  });

  const adidasFemaleSizes = await prisma.sizes.findMany({
    where: { brand_id: brands[0].brand_id, gender: 'female' },
  });

  for (const size of adidasFemaleSizes) {
    await prisma.product_variants.create({
      data: {
        product_id: prod1.product_id,
        size_id: size.size_id,
        sku: `ADIDAS-GFXTEE-WM-BLK-${size.size_label}`,
        cost_price: 200000,
        base_price: 450000,
        quantity: 50,
        attribute: { color: 'Black', gender: 'Women', size: size.size_label },
      },
    });
  }

  for (const size of adidasMaleSizes) {
    await prisma.product_variants.create({
      data: {
        product_id: prod2.product_id,
        size_id: size.size_id,
        sku: `ADIDAS-GFXTEE-M-WHT-${size.size_label}`,
        cost_price: 200000,
        base_price: 450000,
        quantity: 50,
        attribute: { color: 'White', gender: 'Men', size: size.size_label },
      },
    });
  }

  // ================================
  // 11. Vouchers
  // ================================
  console.log('🎟️  Seeding vouchers...');
  await prisma.vouchers.createMany({
    data: [
      {
        title: 'Giam10',
        description: 'Giảm 10% đơn từ 300k',
        discount_type: 'percent',
        discount_value: 10,
        min_order_value: 300000,
        max_discount: 50000,
        quantity: 100,
      },
      {
        title: 'Tru50000',
        description: 'Giảm 50k đơn từ 400k',
        discount_type: 'fixed',
        discount_value: 50000,
        min_order_value: 400000,
        max_discount: 50000,
        quantity: 50,
      },
    ],
  });

  // ================================
  // 12. Site Contents (FAQ, Policies)
  // ================================
  console.log('📄 Seeding site_contents (FAQ, Policies)...');

  const siteContents = [
    // FAQ
    {
      slug: 'faq-shipping-time',
      title: 'Thời gian giao hàng bao lâu?',
      content: `Chúng tôi cung cấp giao hàng miễn phí cho các đơn hàng từ 100,000 VND.

Thời gian giao hàng:
- Hà Nội & TP.HCM: 2-3 ngày làm việc
- Các tỉnh khác: 3-5 ngày làm việc
- Giao hàng ngoài giờ hành chính: +1 ngày

Lưu ý: Thời gian tính từ lúc đơn hàng được xác nhận thanh toán.`,
      category: 'FAQ',
      tags: ['giao-hang', 'shipping', 'thoi-gian'],
    },
    {
      slug: 'faq-return-policy',
      title: 'Chính sách hoàn trả như thế nào?',
      content: `Chúng tôi cấp 30 ngày hoàn tiền hoàn toàn nếu bạn không hài lòng.

Điều kiện hoàn trả:
- Hàng hóa phải ở tình trạng nguyên bản
- Chưa sử dụng hoặc giặt
- Còn tag và packaging gốc
- Hoàn tiền trong 5-7 ngày làm việc

Hoàn trả miễn phí:
- Chúng tôi cung cấp nhãn vận chuyển miễn phí
- Không hỏi lý do hoàn trả`,
      category: 'FAQ',
      tags: ['hoan-tra', 'return', 'chinh-sach'],
    },
    {
      slug: 'faq-sizing-guide',
      title: 'Cách chọn size phù hợp?',
      content: `Để chọn size phù hợp, bạn cần biết:
- Chiều cao (cm)
- Cân nặng (kg)
- Các số đo cơ thể (ngực, vai, dài áo)

Hướng dẫn chọn size:
1. Xem bảng size chi tiết theo từng thương hiệu
2. Đối chiếu với số đo cơ thể của bạn
3. Nếu nằm giữa 2 size, chọn size lớn hơn để thoải mái
4. Sử dụng tính năng "Size Recommendation" để được gợi ý

Lưu ý: Mỗi thương hiệu có tiêu chí size khác nhau.`,
      category: 'FAQ',
      tags: ['size', 'fit', 'bang-size', 'huong-dan'],
    },
    {
      slug: 'faq-payment-methods',
      title: 'Hỗ trợ những phương thức thanh toán nào?',
      content: `Chúng tôi hỗ trợ nhiều phương thức thanh toán an toàn:

1. Thẻ tín dụng/ghi nợ: Visa, Mastercard, JCB
2. Ví điện tử: Momo, ZaloPay, AirPay
3. Chuyển khoản ngân hàng: Chuyển trong 1 giờ
4. Thanh toán khi nhận hàng (COD): Áp dụng toàn quốc, phí 15,000 VND

Tất cả giao dịch được mã hóa SSL bảo mật.`,
      category: 'FAQ',
      tags: ['thanh-toan', 'payment', 'the', 'vi-dien-tu'],
    },
    {
      slug: 'faq-exchange-policy',
      title: 'Có thể đổi size không?',
      content: `Có, bạn hoàn toàn có thể đổi size!

Điều kiện đổi:
- Trong vòng 15 ngày kể từ ngày nhận hàng
- Hàng phải ở tình trạng nguyên bản
- Chưa sử dụng hoặc giặt

Chi phí đổi:
- Đổi cùng size/màu/sản phẩm: Miễn phí
- Đổi size khác: Miễn phí (chúng tôi chịu phí vận chuyển)

Quy trình:
1. Liên hệ CS để thông báo muốn đổi
2. Nhận nhãn vận chuyển miễn phí
3. Gửi hàng về
4. Nhận hàng mới trong 3-5 ngày`,
      category: 'FAQ',
      tags: ['doi', 'exchange', 'size-khac'],
    },
    // POLICIES
    {
      slug: 'policy-customer-protection',
      title: 'Chính sách bảo vệ khách hàng',
      content: `CHÍNH SÁCH BẢO VỆ KHÁCH HÀNG - 100% AN TOÀN

1. Quyền bảo vệ
   - Mọi khách hàng được bảo vệ tối đa 100% nếu sản phẩm không phù hợp mô tả
   - Chúng tôi cam kết hàng chính hãng 100%

2. Hoàn tiền
   - Hoàn tiền trong 5-7 ngày làm việc
   - Không câu hỏi, không phức tạp
   - Hoàn lại toàn bộ số tiền thanh toán

3. Không hỏi lý do
   - Bạn không cần giải thích vì sao muốn trả
   - Chúng tôi tin tưởng khách hàng

4. Miễn phí vận chuyển
   - Hoàn trả miễn phí cho khách hàng
   - Chúng tôi cung cấp nhãn vận chuyển

5. Hỗ trợ 24/7
   - Email: support@shop.vn
   - Live chat trên website`,
      category: 'POLICY',
      tags: ['bao-ve', 'customer-protection', 'chinh-sach'],
    },
    {
      slug: 'policy-data-security',
      title: 'Chính sách bảo mật dữ liệu',
      content: `CHÍNH SÁCH BẢO MẬT DỮ LIỆU CÁ NHÂN

1. Bảo vệ thông tin cá nhân
   - Không chia sẻ thông tin với bên thứ ba
   - Chỉ dùng cho xử lý đơn hàng
   - Không gửi quảng cáo nếu không đồng ý

2. Mã hóa dữ liệu
   - Mã hóa SSL cho tất cả giao dịch
   - Database được bảo vệ nhiều lớp
   - Backup hàng ngày

3. Quyền của khách hàng
   - Quyền truy cập: Xem dữ liệu của bạn
   - Quyền sửa: Cập nhật thông tin cá nhân
   - Quyền xóa: Yêu cầu xóa dữ liệu

4. Tuân thủ pháp luật
   - GDPR Compliant (EU)
   - Tuân thủ luật Việt Nam`,
      category: 'POLICY',
      tags: ['bao-mat', 'data-security', 'privacy'],
    },
  ];

  for (const content of siteContents) {
    await prisma.site_contents.upsert({
      where: { slug: content.slug },
      update: {
        title: content.title,
        content: content.content,
        category: content.category,
        tags: content.tags,
      },
      create: {
        slug: content.slug,
        title: content.title,
        content: content.content,
        category: content.category,
        tags: content.tags,
        status: true,
      },
    });
  }

  console.log(`✅ Seeded ${siteContents.length} site contents`);

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
