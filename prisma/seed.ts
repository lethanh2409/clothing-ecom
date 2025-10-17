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
    {
      customerIdx: 2,
      name: 'Nguyễn Văn C',
      phone: '0900000005',
      province: 'Tỉnh Bắc Giang',
      district: 'Quận Hiệp Hòa',
      ward: 'Thị trấn Thắng',
      street: 'số 5 khu 3',
      house: '19',
      default: true,
    },
    {
      customerIdx: 3,
      name: 'Phạm Quang Y',
      phone: '0900000012',
      province: 'Tỉnh Bình Dương',
      district: 'Thành phố Dĩ An',
      ward: 'Phường Tân Bình',
      street: 'Nguyễn Thị Minh Khai',
      house: '979',
      default: true,
    },
    {
      customerIdx: 4,
      name: 'Trần X',
      phone: '0900000013',
      province: 'Thành phố Cần Thơ',
      district: 'Quận Cái Răng',
      ward: 'Phường Lê Bình',
      street: 'Phạm Hùng',
      house: '164/2C',
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

  // Sizes cho Adidas (brand_id 1)
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

  // Sizes cho Nike (brand_id 2)
  const nikeSizes = [
    {
      gender: 'male',
      label: 'S',
      height: '1m60–1m68',
      weight: '50–60kg',
      measurements: { chest: 50, shoulder: 46, length: 67 },
    },
    {
      gender: 'male',
      label: 'M',
      height: '1m68–1m75',
      weight: '60–70kg',
      measurements: { chest: 52, shoulder: 48, length: 69 },
    },
    {
      gender: 'male',
      label: 'L',
      height: '1m75–1m82',
      weight: '70–80kg',
      measurements: { chest: 54, shoulder: 50, length: 71 },
    },
    {
      gender: 'male',
      label: 'XL',
      height: '1m82–1m90',
      weight: '80–90kg',
      measurements: { chest: 56, shoulder: 52, length: 73 },
    },
    {
      gender: 'female',
      label: 'S',
      height: '1m50–1m58',
      weight: '40–50kg',
      measurements: { chest: 45, shoulder: 41, length: 63 },
    },
    {
      gender: 'female',
      label: 'M',
      height: '1m58–1m65',
      weight: '50–60kg',
      measurements: { chest: 47, shoulder: 43, length: 65 },
    },
    {
      gender: 'female',
      label: 'L',
      height: '1m65–1m72',
      weight: '60–70kg',
      measurements: { chest: 49, shoulder: 45, length: 67 },
    },
    {
      gender: 'female',
      label: 'XL',
      height: '1m72–1m80',
      weight: '70–80kg',
      measurements: { chest: 51, shoulder: 47, length: 69 },
    },
  ];

  // Sizes cho Uniqlo (brand_id 3)
  const uniqloSizes = [
    {
      gender: 'unisex',
      label: 'XS',
      height: '1m50–1m60',
      weight: '40–50kg',
      measurements: { chest: 44, shoulder: 40, length: 62 },
    },
    {
      gender: 'unisex',
      label: 'S',
      height: '1m60–1m68',
      weight: '50–60kg',
      measurements: { chest: 48, shoulder: 44, length: 66 },
    },
    {
      gender: 'unisex',
      label: 'M',
      height: '1m68–1m75',
      weight: '60–70kg',
      measurements: { chest: 52, shoulder: 48, length: 70 },
    },
    {
      gender: 'unisex',
      label: 'L',
      height: '1m75–1m82',
      weight: '70–80kg',
      measurements: { chest: 56, shoulder: 52, length: 74 },
    },
    {
      gender: 'unisex',
      label: 'XL',
      height: '1m82–1m90',
      weight: '80–90kg',
      measurements: { chest: 60, shoulder: 56, length: 78 },
    },
  ];

  // Sizes cho Local Brands (The Bad Habit, Ssstuter, Degrey, Coolmate)
  const localBrandSizes = [
    {
      gender: 'male',
      label: 'S',
      height: '1m58–1m65',
      weight: '48–58kg',
      measurements: { chest: 49, shoulder: 45, length: 67 },
    },
    {
      gender: 'male',
      label: 'M',
      height: '1m65–1m73',
      weight: '58–68kg',
      measurements: { chest: 51, shoulder: 47, length: 69 },
    },
    {
      gender: 'male',
      label: 'L',
      height: '1m73–1m80',
      weight: '68–78kg',
      measurements: { chest: 53, shoulder: 49, length: 71 },
    },
    {
      gender: 'male',
      label: 'XL',
      height: '1m80–1m88',
      weight: '78–88kg',
      measurements: { chest: 55, shoulder: 51, length: 73 },
    },
    {
      gender: 'female',
      label: 'S',
      height: '1m48–1m56',
      weight: '38–48kg',
      measurements: { chest: 44, shoulder: 40, length: 62 },
    },
    {
      gender: 'female',
      label: 'M',
      height: '1m56–1m63',
      weight: '48–58kg',
      measurements: { chest: 46, shoulder: 42, length: 64 },
    },
    {
      gender: 'female',
      label: 'L',
      height: '1m63–1m70',
      weight: '58–68kg',
      measurements: { chest: 48, shoulder: 44, length: 66 },
    },
    {
      gender: 'female',
      label: 'XL',
      height: '1m70–1m78',
      weight: '68–78kg',
      measurements: { chest: 50, shoulder: 46, length: 68 },
    },
  ];

  // Insert sizes cho từng brand
  for (const size of adidasSizes) {
    await prisma.sizes.create({
      data: {
        brand_id: brands[0].brand_id, // Adidas
        gender: size.gender,
        size_label: size.label,
        height_range: size.height,
        weight_range: size.weight,
        measurements: size.measurements,
      },
    });
  }

  for (const size of nikeSizes) {
    await prisma.sizes.create({
      data: {
        brand_id: brands[1].brand_id, // Nike
        gender: size.gender,
        size_label: size.label,
        height_range: size.height,
        weight_range: size.weight,
        measurements: size.measurements,
      },
    });
  }

  for (const size of uniqloSizes) {
    await prisma.sizes.create({
      data: {
        brand_id: brands[2].brand_id, // Uniqlo
        gender: size.gender,
        size_label: size.label,
        height_range: size.height,
        weight_range: size.weight,
        measurements: size.measurements,
      },
    });
  }

  // Local brands (The Bad Habit, Ssstuter, Degrey, Coolmate)
  for (let i = 6; i < 10; i++) {
    for (const size of localBrandSizes) {
      await prisma.sizes.create({
        data: {
          brand_id: brands[i].brand_id,
          gender: size.gender,
          size_label: size.label,
          height_range: size.height,
          weight_range: size.weight,
          measurements: size.measurements,
        },
      });
    }
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
        category_name: 'Áo polo nam',
        slug: 'ao-polo-nam',
        description: 'Polo shirt classic',
        parent_id: catDoNam.category_id,
      },
      {
        category_name: 'Áo khoác nam',
        slug: 'ao-khoac-nam',
        description: 'Jacket, hoodie, blazer',
        parent_id: catDoNam.category_id,
      },
      {
        category_name: 'Quần jean nam',
        slug: 'quan-jean-nam',
        description: 'Denim pants',
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
        category_name: 'Áo polo nữ',
        slug: 'ao-polo-nu',
        description: 'Polo shirt classic',
        parent_id: catDoNu.category_id,
      },
      {
        category_name: 'Áo khoác nữ',
        slug: 'ao-khoac-nu',
        description: 'Jacket, hoodie, blazer',
        parent_id: catDoNu.category_id,
      },
      {
        category_name: 'Quần jean nữ',
        slug: 'quan-jean-nu',
        description: 'Denim pants',
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
  // 9. Lookbooks
  // ================================
  console.log('📸 Seeding lookbooks...');
  await prisma.lookbooks.create({
    data: {
      title: 'Adiclub Days',
      slug: 'adiclub-days',
      description: 'BST mùa hè',
      image:
        'https://brand.assets.adidas.com/image/upload/f_auto,q_auto:best,fl_lossy/if_w_gt_1920,w_1920/6181380_CAM_Onsite_FW_25_adi_Club_Days_19_30_Sep_VN_Onsite_Masthed_Banner_DT_2880x1280_D_b9c97414b6.jpg',
    },
  });

  // ================================
  // 10. Vouchers
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
        start_date: new Date('2025-01-01'),
        end_date: new Date('2025-12-31'),
      },
      {
        title: 'Tru50000',
        description: 'Giảm 50k đơn từ 400k',
        discount_type: 'fixed',
        discount_value: 50000,
        min_order_value: 400000,
        max_discount: 50000,
        quantity: 50,
        start_date: new Date('2025-01-01'),
        end_date: new Date('2025-12-31'),
      },
      {
        title: 'Giam20',
        description: 'Giảm 20% đơn từ 500k',
        discount_type: 'percent',
        discount_value: 20,
        min_order_value: 500000,
        max_discount: 150000,
        quantity: 100,
        status: false,
        start_date: new Date('2025-01-01'),
        end_date: new Date('2025-12-31'),
      },
      {
        title: 'Tru20000',
        description: 'Giảm 20k đơn từ 200k',
        discount_type: 'fixed',
        discount_value: 20000,
        min_order_value: 200000,
        max_discount: 20000,
        quantity: 50,
        start_date: new Date('2025-01-01'),
        end_date: new Date('2025-12-31'),
      },
    ],
  });

  // ================================
  // 11. Products
  // ================================
  console.log('📦 Seeding products...');

  // Lấy brands từ DB
  const allBrands = await prisma.brands.findMany();
  const adidasBrand = allBrands.find((b) => b.slug === 'adidas');

  // Lấy categories
  const categories = await prisma.categories.findMany();
  const catAoThunNam = categories.find((c) => c.slug === 'ao-thun-nam');
  const catAoThunNu = categories.find((c) => c.slug === 'ao-thun-nu');
  const catQuanShortNam = categories.find((c) => c.slug === 'quan-short-nam');
  const catQuanShortNu = categories.find((c) => c.slug === 'quan-short-nu');

  // Product 1: GFX SAIGON 2 TEE WM (Women)
  const prod1 = await prisma.products.create({
    data: {
      brand_id: adidasBrand!.brand_id, // Adidas
      category_id: catAoThunNu!.category_id,
      product_name: 'GFX SAIGON 2 TEE WM',
      slug: 'gfx-saigon-2-tee-wm',
      description: 'Áo thun nữ Adidas',
    },
  });

  // Product 2: GFX SAIGON 2 TEE M (Men)
  const prod2 = await prisma.products.create({
    data: {
      brand_id: adidasBrand!.brand_id,
      category_id: catAoThunNam!.category_id,
      product_name: 'GFX SAIGON 2 TEE M',
      slug: 'gfx-saigon-2-tee-m',
      description: 'Áo thun nam Adidas',
    },
  });

  // Product 3: GFX SAIGON 1 TEE WM
  const prod3 = await prisma.products.create({
    data: {
      brand_id: adidasBrand!.brand_id,
      category_id: catAoThunNu!.category_id,
      product_name: 'GFX SAIGON 1 TEE WM',
      slug: 'gfx-saigon-1-tee-wm',
      description: 'Áo thun nữ Adidas GFX SAIGON 1',
    },
  });

  // Product 4: GFX SAIGON 1 TEE M
  const prod4 = await prisma.products.create({
    data: {
      brand_id: adidasBrand!.brand_id,
      category_id: catAoThunNam!.category_id,
      product_name: 'GFX SAIGON 1 TEE M',
      slug: 'gfx-saigon-1-tee-m',
      description: 'Áo thun nam Adidas GFX SAIGON 1',
    },
  });

  // Product 5: GFX HANOI M TEE
  const prod5 = await prisma.products.create({
    data: {
      brand_id: adidasBrand!.brand_id,
      category_id: catAoThunNam!.category_id,
      product_name: 'GFX HANOI M TEE',
      slug: 'gfx-hanoi-m-tee',
      description: 'Áo thun Adidas GFX HANOI (Men)',
    },
  });

  // Product 6: GFX HOI AN M TEE
  const prod6 = await prisma.products.create({
    data: {
      brand_id: adidasBrand!.brand_id,
      category_id: catAoThunNam!.category_id,
      product_name: 'GFX HOI AN M TEE',
      slug: 'gfx-hoi-an-m-tee',
      description: 'Áo thun Adidas GFX HOI AN (Men)',
    },
  });

  // Product 7: Runners CLIMACOOL Shorts M
  const prod7 = await prisma.products.create({
    data: {
      brand_id: adidasBrand!.brand_id,
      category_id: catQuanShortNam!.category_id,
      product_name: 'Runners CLIMACOOL Shorts M',
      slug: 'runners-climacool-shorts-m',
      description: 'Quần short nam Adidas Runners CLIMACOOL',
    },
  });

  // Product 8: Adicolor 3-Stripes Mini Skirt WM
  const prod8 = await prisma.products.create({
    data: {
      brand_id: adidasBrand!.brand_id,
      category_id: catQuanShortNu!.category_id,
      product_name: 'Adicolor 3-Stripes Mini Skirt WM',
      slug: 'adicolor-3-stripes-mini-skirt-wm',
      description: 'Váy ngắn nữ Adidas Adicolor 3-Stripes Mini Skirt',
    },
  });

  // ================================
  // 12. Product Variants (với size_id)
  // ================================
  console.log('🏷️  Seeding product variants...');

  // Lấy sizes của Adidas
  const adidasMaleSizes = await prisma.sizes.findMany({
    where: { brand_id: adidasBrand!.brand_id, gender: 'male' },
    orderBy: { size_label: 'asc' },
  });

  const adidasFemaleSizes = await prisma.sizes.findMany({
    where: { brand_id: adidasBrand!.brand_id, gender: 'female' },
    orderBy: { size_label: 'asc' },
  });

  const sizeMap = {
    male: {
      S: adidasMaleSizes.find((s) => s.size_label === 'S')?.size_id,
      M: adidasMaleSizes.find((s) => s.size_label === 'M')?.size_id,
      L: adidasMaleSizes.find((s) => s.size_label === 'L')?.size_id,
      XL: adidasMaleSizes.find((s) => s.size_label === 'XL')?.size_id,
    },
    female: {
      S: adidasFemaleSizes.find((s) => s.size_label === 'S')?.size_id,
      M: adidasFemaleSizes.find((s) => s.size_label === 'M')?.size_id,
      L: adidasFemaleSizes.find((s) => s.size_label === 'L')?.size_id,
      XL: adidasFemaleSizes.find((s) => s.size_label === 'XL')?.size_id,
    },
  };

  // Variants cho prod1 (GFX SAIGON 2 TEE WM - Black)
  const variantsProd1: any[] = [];
  for (const size of ['S', 'M', 'L', 'XL']) {
    const variant = await prisma.product_variants.create({
      data: {
        product_id: prod1.product_id,
        size_id: sizeMap.female[size as keyof typeof sizeMap.female],
        sku: `ADIDAS-GFXTEE-WM-BLK-${size}`,
        barcode: `3341${['S', 'M', 'L', 'XL'].indexOf(size) + 1}`,
        cost_price: 200000,
        base_price: 450000,
        quantity: 30,
        attribute: { color: 'Black', gender: 'Women', size },
      },
    });
    variantsProd1.push(variant);
  }

  // Variants cho prod2 (GFX SAIGON 2 TEE M - White)
  const variantsProd2: any[] = [];
  for (const size of ['S', 'M', 'L', 'XL']) {
    const variant = await prisma.product_variants.create({
      data: {
        product_id: prod2.product_id,
        size_id: sizeMap.male[size as keyof typeof sizeMap.male],
        sku: `ADIDAS-GFXTEE-M-WHT-${size}`,
        barcode: `3351${['S', 'M', 'L', 'XL'].indexOf(size) + 1}`,
        cost_price: 200000,
        base_price: 450000,
        quantity: 30,
        attribute: { color: 'White', gender: 'Men', size },
      },
    });
    variantsProd2.push(variant);
  }

  // Variants cho prod3 (GFX SAIGON 1 TEE WM - White)
  for (const size of ['S', 'M', 'L', 'XL']) {
    await prisma.product_variants.create({
      data: {
        product_id: prod3.product_id,
        size_id: sizeMap.female[size as keyof typeof sizeMap.female],
        sku: `ADIDAS-GFX1TEE-WM-WHT-${size}`,
        barcode: `4101${['S', 'M', 'L', 'XL'].indexOf(size) + 1}`,
        cost_price: 200000,
        base_price: 450000,
        quantity: 30,
        attribute: { color: 'White', size },
      },
    });
  }

  // Variants cho prod4 (GFX SAIGON 1 TEE M - Black)
  for (const size of ['S', 'M', 'L', 'XL']) {
    await prisma.product_variants.create({
      data: {
        product_id: prod4.product_id,
        size_id: sizeMap.male[size as keyof typeof sizeMap.male],
        sku: `ADIDAS-GFX1TEE-M-BLK-${size}`,
        barcode: `4102${['S', 'M', 'L', 'XL'].indexOf(size) + 1}`,
        cost_price: 200000,
        base_price: 450000,
        quantity: 30,
        attribute: { color: 'Black', size },
      },
    });
  }

  // Variants cho prod5 (GFX HANOI M TEE - White & Black)
  const variantsProd5: any[] = [];
  for (const color of ['White', 'Black']) {
    for (const size of ['S', 'M', 'L', 'XL']) {
      const variant = await prisma.product_variants.create({
        data: {
          product_id: prod5.product_id,
          size_id: sizeMap.male[size as keyof typeof sizeMap.male],
          sku: `ADIDAS-GFXHANOI-M-${color.substring(0, 3).toUpperCase()}-${size}`,
          barcode: `420${color === 'White' ? '1' : '2'}${['S', 'M', 'L', 'XL'].indexOf(size) + 1}`,
          cost_price: 200000,
          base_price: 450000,
          quantity: 30,
          attribute: { color, gender: 'Men', size },
        },
      });
      variantsProd5.push(variant);
    }
  }

  // Variants cho prod6 (GFX HOI AN M TEE - White & Black)
  const variantsProd6: any[] = [];
  for (const color of ['White', 'Black']) {
    for (const size of ['S', 'M', 'L', 'XL']) {
      const variant = await prisma.product_variants.create({
        data: {
          product_id: prod6.product_id,
          size_id: sizeMap.male[size as keyof typeof sizeMap.male],
          sku: `ADIDAS-GFXHOIAN-M-${color.substring(0, 3).toUpperCase()}-${size}`,
          barcode: `430${color === 'White' ? '1' : '2'}${['S', 'M', 'L', 'XL'].indexOf(size) + 1}`,
          cost_price: 200000,
          base_price: 450000,
          quantity: 30,
          attribute: { color, gender: 'Men', size },
        },
      });
      variantsProd6.push(variant);
    }
  }

  // Variants cho prod7 (Runners CLIMACOOL Shorts - Black)
  const variantsProd7: any[] = [];
  for (const size of ['S', 'M', 'L', 'XL']) {
    const variant = await prisma.product_variants.create({
      data: {
        product_id: prod7.product_id,
        size_id: sizeMap.male[size as keyof typeof sizeMap.male],
        sku: `ADIDAS-CLIMACOOL-M-BLK-${size}`,
        barcode: `4401${['S', 'M', 'L', 'XL'].indexOf(size) + 1}`,
        cost_price: 300000,
        base_price: 650000,
        quantity: 20,
        attribute: { color: 'Black', size },
      },
    });
    variantsProd7.push(variant);
  }

  // Variants cho prod8 (Adicolor Mini Skirt - Black)
  const variantsProd8: any[] = [];
  for (const size of ['S', 'M', 'L', 'XL']) {
    const variant = await prisma.product_variants.create({
      data: {
        product_id: prod8.product_id,
        size_id: sizeMap.female[size as keyof typeof sizeMap.female],
        sku: `ADIDAS-3STRIPES-WM-BLK-${size}`,
        barcode: `4501${['S', 'M', 'L', 'XL'].indexOf(size) + 1}`,
        cost_price: 350000,
        base_price: 750000,
        quantity: 15,
        attribute: { color: 'Black', size },
      },
    });
    variantsProd8.push(variant);
  }

  // ================================
  // 13. Variant Assets
  // ================================
  console.log('🖼️  Seeding variant assets...');

  // Assets cho prod1 (GFX SAIGON 2 TEE WM - Black)
  for (const variant of variantsProd1) {
    await prisma.variant_assets.create({
      data: {
        variant_id: variant.variant_id,
        url: 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/4f16047cd5c1449988f96425f804dfdb_9366/GFX_SAIGON_2_TEE_-_BLACK_Black_KL9336_21_model.jpg',
        type: 'image',
        is_primary: true,
      },
    });
    await prisma.variant_assets.create({
      data: {
        variant_id: variant.variant_id,
        url: 'https://assets.adidas.com/images/w_600,f_auto,q_auto/e6b64e96d5aa410ebcd18dfd3e086ee7_9366/GFX_SAIGON_2_TEE_-_BLACK_Black_KL9336_41_detail_hover.jpg',
        type: 'image',
        is_primary: false,
      },
    });
  }

  // Assets cho prod2 (GFX SAIGON 2 TEE M - White)
  for (const variant of variantsProd2) {
    await prisma.variant_assets.create({
      data: {
        variant_id: variant.variant_id,
        url: 'https://assets.adidas.com/images/w_600,f_auto,q_auto/0495d476c92b4b37aab43364eb0038ce_9366/GFX_SAIGON_2_TEE_-_WHITE_White_KL9338_21_model.jpg',
        type: 'image',
        is_primary: true,
      },
    });
    await prisma.variant_assets.create({
      data: {
        variant_id: variant.variant_id,
        url: 'https://assets.adidas.com/images/w_600,f_auto,q_auto/41b17988498b48f5b5da30d938ac016c_9366/GFX_SAIGON_2_TEE_-_WHITE_White_KL9338_41_detail_hover.jpg',
        type: 'image',
        is_primary: false,
      },
    });
  }

  // ================================
  // 14. Cart cho mỗi customer
  // ================================
  console.log('🛒 Seeding carts...');
  for (const customer of customerRecords) {
    await prisma.cart.create({
      data: {
        customers: { connect: { customer_id: customer.customer_id } },
        session_id: `session-${customer.customer_id}`,
        total_price: 0,
      },
    });
  }

  // ================================
  // 15. Inventory Transactions (Nhập kho ban đầu)
  // ================================
  console.log('📊 Seeding inventory transactions...');
  const allVariants = await prisma.product_variants.findMany();
  for (const variant of allVariants) {
    await prisma.inventory_transactions.create({
      data: {
        variant_id: variant.variant_id,
        change_quantity: 100,
        reason: 'initial stock',
      },
    });
  }

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
