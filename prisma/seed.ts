// import { PrismaClient } from '@prisma/client';
// import * as bcrypt from 'bcrypt';

// const prisma = new PrismaClient();

// async function main() {
//   console.log('🌱 Starting seed...');

//   // ================================
//   // 1. Roles
//   // ================================
//   console.log('📝 Seeding roles...');
//   const adminRole = await prisma.roles.upsert({
//     where: { role_name: 'ADMIN' },
//     update: {},
//     create: { role_name: 'ADMIN', description: 'Quản trị hệ thống' },
//   });

//   const staffRole = await prisma.roles.upsert({
//     where: { role_name: 'STAFF' },
//     update: {},
//     create: { role_name: 'STAFF', description: 'Nhân viên vận hành' },
//   });

//   const customerRole = await prisma.roles.upsert({
//     where: { role_name: 'CUSTOMER' },
//     update: {},
//     create: { role_name: 'CUSTOMER', description: 'Khách hàng' },
//   });

//   // ================================
//   // 2. Users
//   // ================================
//   console.log('👤 Seeding users...');
//   const hashedPassword = await bcrypt.hash('password123', 10);

//   const admin = await prisma.users.upsert({
//     where: { username: 'admin' },
//     update: {},
//     create: {
//       username: 'admin',
//       password: hashedPassword,
//       email: 'admin@demo.vn',
//       phone: '0900000001',
//       full_name: 'Quản Trị',
//     },
//   });

//   const staff1 = await prisma.users.upsert({
//     where: { username: 'staff1' },
//     update: {},
//     create: {
//       username: 'staff1',
//       password: hashedPassword,
//       email: 'staff1@demo.vn',
//       phone: '0900000002',
//       full_name: 'Nhân Viên 1',
//     },
//   });

//   const customers: any[] = [];
//   for (let i = 1; i <= 5; i++) {
//     const customer = await prisma.users.upsert({
//       where: { username: `khach${i}` },
//       update: {},
//       create: {
//         username: `khach${i}`,
//         password: hashedPassword,
//         email: `khach${i}@demo.vn`,
//         phone: `090000000${i + 2}`,
//         full_name: `Nguyễn Văn ${String.fromCharCode(64 + i)}`,
//       },
//     });
//     customers.push(customer);
//   }

//   // ================================
//   // 3. User Roles
//   // ================================
//   console.log('🔗 Mapping user roles...');
//   await prisma.user_role.createMany({
//     data: [
//       { user_id: admin.user_id, role_id: adminRole.role_id },
//       { user_id: admin.user_id, role_id: staffRole.role_id },
//       { user_id: staff1.user_id, role_id: staffRole.role_id },
//       ...customers.map((c) => ({ user_id: c.user_id, role_id: customerRole.role_id })),
//     ],
//     skipDuplicates: true,
//   });

//   // ================================
//   // 4. Customers
//   // ================================
//   console.log('👥 Seeding customers...');
//   const genders = ['male', 'female', 'male', 'male', 'female'];
//   const customerRecords: any[] = [];

//   for (let i = 0; i < customers.length; i++) {
//     const customerRecord = await prisma.customers.upsert({
//       where: { user_id: customers[i].user_id },
//       update: {},
//       create: {
//         user_id: customers[i].user_id,
//         birthday: new Date(1999 + i, 8 + i, 9 + i),
//         gender: genders[i] as any,
//       },
//     });
//     customerRecords.push(customerRecord);
//   }

//   // ================================
//   // 5. Addresses
//   // ================================
//   console.log('📍 Seeding addresses...');
//   const addressesData = [
//     {
//       customerIdx: 0,
//       name: 'Nguyễn Văn A',
//       phone: '0900000003',
//       province: 'Thành phố Hồ Chí Minh',
//       district: 'Quận 1',
//       ward: 'Phường Bến Nghé',
//       street: 'Lê Lợi',
//       house: '12A',
//       default: true,
//     },
//     {
//       customerIdx: 0,
//       name: 'Nguyễn Văn A',
//       phone: '0900000003',
//       province: 'Thành phố Hà Nội',
//       district: 'Quận Hoàn Kiếm',
//       ward: 'Phường Cửa Nam',
//       street: 'Tràng Tiền',
//       house: '22',
//       default: false,
//     },
//     {
//       customerIdx: 1,
//       name: 'Lê Văn Z',
//       phone: '0900000011',
//       province: 'Thành phố Hồ Chí Minh',
//       district: 'Quận Bình Thạnh',
//       ward: 'Phường 17',
//       street: 'Nguyễn Cửu Vân',
//       house: '63',
//       default: true,
//     },
//   ];

//   for (const addr of addressesData) {
//     await prisma.addresses.create({
//       data: {
//         customer_id: customerRecords[addr.customerIdx].customer_id,
//         consignee_name: addr.name,
//         consignee_phone: addr.phone,
//         province: addr.province,
//         district: addr.district,
//         ward: addr.ward,
//         street: addr.street,
//         house_num: addr.house,
//         is_default: addr.default,
//       },
//     });
//   }

//   // ================================
//   // 6. Brands
//   // ================================
//   console.log('🏷️  Seeding brands...');
//   const brandsData = [
//     { name: 'Adidas', slug: 'adidas', desc: 'Thương hiệu thể thao quốc tế' },
//     { name: 'Nike', slug: 'nike', desc: 'Just Do It - Thể thao hàng đầu' },
//     { name: 'Uniqlo', slug: 'uniqlo', desc: 'Thời trang Nhật Bản' },
//     { name: 'H&M', slug: 'h-m', desc: 'Fast fashion Sweden' },
//     { name: 'Zara', slug: 'zara', desc: 'Thời trang Tây Ban Nha' },
//   ];

//   type BrandLite = { brand_id: number; slug: string | null; brand_name: string };
//   const brands: BrandLite[] = [];
//   for (const b of brandsData) {
//     const brand = await prisma.brands.upsert({
//       where: { slug: b.slug },
//       update: {},
//       create: { brand_name: b.name, slug: b.slug, description: b.desc },
//     });
//     brands.push({
//       brand_id: brand.brand_id,
//       slug: brand.slug,
//       brand_name: brand.brand_name,
//     });
//   }

//   // ================================
//   // 7. Sizes cho tất cả brands
//   // ================================
//   console.log('📏 Seeding sizes...');

//   const adidasSizes = [
//     {
//       gender: 'male',
//       label: 'S',
//       height: '1m60–1m68',
//       weight: '50–60kg',
//       measurements: { chest: 50, shoulder: 46, length: 68 },
//     },
//     {
//       gender: 'male',
//       label: 'M',
//       height: '1m68–1m75',
//       weight: '60–70kg',
//       measurements: { chest: 52, shoulder: 48, length: 70 },
//     },
//     {
//       gender: 'male',
//       label: 'L',
//       height: '1m75–1m82',
//       weight: '70–80kg',
//       measurements: { chest: 54, shoulder: 50, length: 72 },
//     },
//     {
//       gender: 'male',
//       label: 'XL',
//       height: '1m82–1m90',
//       weight: '80–90kg',
//       measurements: { chest: 56, shoulder: 52, length: 74 },
//     },
//     {
//       gender: 'female',
//       label: 'S',
//       height: '1m50–1m58',
//       weight: '40–50kg',
//       measurements: { chest: 46, shoulder: 42, length: 64 },
//     },
//     {
//       gender: 'female',
//       label: 'M',
//       height: '1m58–1m65',
//       weight: '50–60kg',
//       measurements: { chest: 48, shoulder: 44, length: 66 },
//     },
//     {
//       gender: 'female',
//       label: 'L',
//       height: '1m65–1m72',
//       weight: '60–70kg',
//       measurements: { chest: 50, shoulder: 46, length: 68 },
//     },
//     {
//       gender: 'female',
//       label: 'XL',
//       height: '1m72–1m80',
//       weight: '70–80kg',
//       measurements: { chest: 52, shoulder: 48, length: 70 },
//     },
//   ];

//   for (const size of adidasSizes) {
//     await prisma.sizes.create({
//       data: {
//         brand_id: brands[0].brand_id,
//         gender: size.gender,
//         size_label: size.label,
//         height_range: size.height,
//         weight_range: size.weight,
//         measurements: size.measurements,
//       },
//     });
//   }

//   // === BỔ SUNG size QUẦN 27–35 CHO TẤT CẢ BRANDS (nam & nữ) ===
//   console.log('📏 Thêm size quần 27–35 cho tất cả brands...');

//   const waistLabels = Array.from({ length: 35 - 27 + 1 }, (_, i) => String(27 + i)); // ['27'...'35']

//   for (const br of brands) {
//     for (const gender of ['male', 'female'] as const) {
//       for (const label of waistLabels) {
//         const existed = await prisma.sizes.findFirst({
//           where: { brand_id: br.brand_id, gender, size_label: label },
//         });
//         if (!existed) {
//           await prisma.sizes.create({
//             data: {
//               brand_id: br.brand_id,
//               gender, // 'male' | 'female'
//               size_label: label, // '27'..'35'
//               height_range: '—', // để text ngắn, tránh null nếu schema bắt buộc
//               weight_range: '—',
//               measurements: { waist: Number(label) }, // JSONB tuỳ ý
//             },
//           });
//         }
//       }
//     }
//   }

//   // === BỔ SUNG size ÁO S/M/L/XL CHO CÁC BRAND KHÁC (nếu thiếu) ===
//   console.log('📏 Bổ sung size áo S/M/L/XL cho mọi brand nếu thiếu...');

//   const shirtLabels: ('S' | 'M' | 'L' | 'XL')[] = ['S', 'M', 'L', 'XL'];

//   for (const br of brands) {
//     for (const gender of ['male', 'female'] as const) {
//       for (const label of shirtLabels) {
//         const existed = await prisma.sizes.findFirst({
//           where: { brand_id: br.brand_id, gender, size_label: label },
//         });
//         if (!existed) {
//           // Lấy thước đo mẫu từ Adidas (brands[0]) nếu có
//           const ref = await prisma.sizes.findFirst({
//             where: { brand_id: brands[0].brand_id, gender, size_label: label },
//           });
//           await prisma.sizes.create({
//             data: {
//               brand_id: br.brand_id,
//               gender,
//               size_label: label,
//               height_range: ref?.height_range ?? '—',
//               weight_range: ref?.weight_range ?? '—',
//               measurements: ref?.measurements ?? {},
//             },
//           });
//         }
//       }
//     }
//   }

//   console.log('✅ Đã đảm bảo size áo và size quần 27–35 cho tất cả brands.');

//   // ================================
//   // 8. Categories
//   // ================================
//   console.log('📂 Seeding categories...');
//   const catDoNam = await prisma.categories.create({
//     data: { category_name: 'Đồ nam', slug: 'do-nam', description: 'Danh mục đồ nam' },
//   });

//   const catDoNu = await prisma.categories.create({
//     data: { category_name: 'Đồ nữ', slug: 'do-nu', description: 'Danh mục đồ nữ' },
//   });

//   await prisma.categories.createMany({
//     data: [
//       {
//         category_name: 'Áo thun nam',
//         slug: 'ao-thun-nam',
//         description: 'T-shirt, tank top',
//         parent_id: catDoNam.category_id,
//       },
//       {
//         category_name: 'Áo sơ mi nam',
//         slug: 'ao-so-mi-nam',
//         description: 'Shirt formal, casual',
//         parent_id: catDoNam.category_id,
//       },
//       {
//         category_name: 'Quần short nam',
//         slug: 'quan-short-nam',
//         description: 'Summer shorts',
//         parent_id: catDoNam.category_id,
//       },
//       {
//         category_name: 'Áo thun nữ',
//         slug: 'ao-thun-nu',
//         description: 'T-shirt, tank top',
//         parent_id: catDoNu.category_id,
//       },
//       {
//         category_name: 'Áo sơ mi nữ',
//         slug: 'ao-so-mi-nu',
//         description: 'Shirt formal, casual',
//         parent_id: catDoNu.category_id,
//       },
//       {
//         category_name: 'Quần short nữ',
//         slug: 'quan-short-nu',
//         description: 'Summer shorts',
//         parent_id: catDoNu.category_id,
//       },
//     ],
//   });

//   await prisma.products.createMany({
//     data: [
//       // ADIDAS (brand_id: 1) - 20 sản phẩm
//       {
//         product_name: 'Áo Thun Adidas Essentials Single Jersey',
//         slug: 'ao-thun-adidas-essentials-single-jersey',
//         description: 'Áo thun nam Adidas Essentials chất liệu cotton thoáng mát',
//         brand_id: 1,
//         category_id: 3, // Áo thun nam
//       },
//       {
//         product_name: 'Quần Short Adidas 3-Stripes',
//         slug: 'quan-short-adidas-3-stripes',
//         description: 'Quần short thể thao nam với 3 sọc đặc trưng của Adidas',
//         brand_id: 1,
//         category_id: 5, // Quần short nam
//       },
//       {
//         product_name: 'Áo Khoác Adidas Tiro Track',
//         slug: 'ao-khoac-adidas-tiro-track',
//         description: 'Áo khoác thể thao Adidas Tiro phong cách bóng đá',
//         brand_id: 1,
//         category_id: 1, // Đồ nam
//       },
//       {
//         product_name: 'Giày Adidas Ultraboost 22',
//         slug: 'giay-adidas-ultraboost-22',
//         description: 'Giày chạy bộ Adidas Ultraboost công nghệ đệm Boost',
//         brand_id: 1,
//         category_id: 1,
//       },
//       {
//         product_name: 'Áo Polo Adidas Club Tennis',
//         slug: 'ao-polo-adidas-club-tennis',
//         description: 'Áo polo tennis Adidas chất liệu thoát mồ hôi',
//         brand_id: 1,
//         category_id: 3,
//       },
//       {
//         product_name: 'Quần Dài Adidas Tiro Training',
//         slug: 'quan-dai-adidas-tiro-training',
//         description: 'Quần dài tập luyện Adidas Tiro với công nghệ Aeroready',
//         brand_id: 1,
//         category_id: 1,
//       },
//       {
//         product_name: 'Áo Tanktop Adidas Own The Run',
//         slug: 'ao-tanktop-adidas-own-the-run',
//         description: 'Áo ba lỗ Adidas cho chạy bộ và gym',
//         brand_id: 1,
//         category_id: 3,
//       },
//       {
//         product_name: 'Giày Adidas Stan Smith',
//         slug: 'giay-adidas-stan-smith',
//         description: 'Giày sneaker Adidas Stan Smith phong cách classic',
//         brand_id: 1,
//         category_id: 1,
//       },
//       {
//         product_name: 'Áo Hoodie Adidas Essentials Fleece',
//         slug: 'ao-hoodie-adidas-essentials-fleece',
//         description: 'Áo hoodie Adidas chất liệu nỉ ấm áp',
//         brand_id: 1,
//         category_id: 1,
//       },
//       {
//         product_name: 'Quần Short Adidas Run It',
//         slug: 'quan-short-adidas-run-it',
//         description: 'Quần short chạy bộ Adidas thoáng khí',
//         brand_id: 1,
//         category_id: 5,
//       },
//       {
//         product_name: 'Giày Adidas Superstar',
//         slug: 'giay-adidas-superstar',
//         description: 'Giày Adidas Superstar mũi vỏ sò huyền thoại',
//         brand_id: 1,
//         category_id: 1,
//       },
//       {
//         product_name: 'Áo Thun Nữ Adidas Essentials Logo',
//         slug: 'ao-thun-nu-adidas-essentials-logo',
//         description: 'Áo thun nữ Adidas với logo thêu nổi bật',
//         brand_id: 1,
//         category_id: 6, // Áo thun nữ
//       },
//       {
//         product_name: 'Quần Legging Adidas Believe This',
//         slug: 'quan-legging-adidas-believe-this',
//         description: 'Quần legging tập yoga Adidas co giãn 4 chiều',
//         brand_id: 1,
//         category_id: 2, // Đồ nữ
//       },
//       {
//         product_name: 'Balo Adidas Classic Badge of Sport',
//         slug: 'balo-adidas-classic-badge-of-sport',
//         description: 'Balo Adidas thiết kế đơn giản, tiện dụng',
//         brand_id: 1,
//         category_id: 1,
//       },
//       {
//         product_name: 'Áo Thun Adidas Adicolor Classics',
//         slug: 'ao-thun-adidas-adicolor-classics',
//         description: 'Áo thun Adidas Adicolor với logo Trefoil',
//         brand_id: 1,
//         category_id: 3,
//       },
//       {
//         product_name: 'Giày Adidas NMD R1',
//         slug: 'giay-adidas-nmd-r1',
//         description: 'Giày Adidas NMD R1 công nghệ Boost đế mềm',
//         brand_id: 1,
//         category_id: 1,
//       },
//       {
//         product_name: 'Quần Short Nữ Adidas Pacer',
//         slug: 'quan-short-nu-adidas-pacer',
//         description: 'Quần short thể thao nữ Adidas Pacer',
//         brand_id: 1,
//         category_id: 8, // Quần short nữ
//       },
//       {
//         product_name: 'Áo Khoác Adidas Essentials Insulated',
//         slug: 'ao-khoac-adidas-essentials-insulated',
//         description: 'Áo khoác phao Adidas giữ ấm mùa đông',
//         brand_id: 1,
//         category_id: 1,
//       },
//       {
//         product_name: 'Giày Adidas Forum Low',
//         slug: 'giay-adidas-forum-low',
//         description: 'Giày Adidas Forum Low phong cách retro',
//         brand_id: 1,
//         category_id: 1,
//       },
//       {
//         product_name: 'Áo Bra Thể Thao Adidas All Me',
//         slug: 'ao-bra-the-thao-adidas-all-me',
//         description: 'Áo bra tập luyện Adidas hỗ trợ tốt',
//         brand_id: 1,
//         category_id: 2,
//       },

//       // NIKE (brand_id: 2) - 20 sản phẩm
//       {
//         product_name: 'Áo Thun Nike Sportswear',
//         slug: 'ao-thun-nike-sportswear',
//         description: 'Áo thun Nike Sportswear với logo Swoosh',
//         brand_id: 2,
//         category_id: 3,
//       },
//       {
//         product_name: 'Giày Nike Air Max 90',
//         slug: 'giay-nike-air-max-90',
//         description: 'Giày Nike Air Max 90 công nghệ đệm khí',
//         brand_id: 2,
//         category_id: 1,
//       },
//       {
//         product_name: 'Quần Short Nike Dri-FIT',
//         slug: 'quan-short-nike-dri-fit',
//         description: 'Quần short Nike Dri-FIT thấm hút mồ hôi',
//         brand_id: 2,
//         category_id: 5,
//       },
//       {
//         product_name: 'Áo Hoodie Nike Club Fleece',
//         slug: 'ao-hoodie-nike-club-fleece',
//         description: 'Áo hoodie Nike chất liệu nỉ bông mềm mại',
//         brand_id: 2,
//         category_id: 1,
//       },
//       {
//         product_name: 'Giày Nike Air Force 1',
//         slug: 'giay-nike-air-force-1',
//         description: 'Giày Nike Air Force 1 07 trắng classic',
//         brand_id: 2,
//         category_id: 1,
//       },
//       {
//         product_name: 'Quần Jogger Nike Tech Fleece',
//         slug: 'quan-jogger-nike-tech-fleece',
//         description: 'Quần jogger Nike Tech Fleece ấm nhẹ',
//         brand_id: 2,
//         category_id: 1,
//       },
//       {
//         product_name: 'Áo Tank Top Nike Pro',
//         slug: 'ao-tank-top-nike-pro',
//         description: 'Áo ba lỗ Nike Pro co giãn 4 chiều',
//         brand_id: 2,
//         category_id: 3,
//       },
//       {
//         product_name: 'Giày Nike React Infinity Run',
//         slug: 'giay-nike-react-infinity-run',
//         description: 'Giày chạy bộ Nike React Infinity',
//         brand_id: 2,
//         category_id: 1,
//       },
//       {
//         product_name: 'Áo Khoác Nike Windrunner',
//         slug: 'ao-khoac-nike-windrunner',
//         description: 'Áo khoác gió Nike Windrunner chống nước',
//         brand_id: 2,
//         category_id: 1,
//       },
//       {
//         product_name: 'Quần Legging Nữ Nike One',
//         slug: 'quan-legging-nu-nike-one',
//         description: 'Quần legging Nike One tập yoga và gym',
//         brand_id: 2,
//         category_id: 2,
//       },
//       {
//         product_name: 'Giày Nike Jordan 1 Mid',
//         slug: 'giay-nike-jordan-1-mid',
//         description: 'Giày Nike Air Jordan 1 Mid phiên bản kinh điển',
//         brand_id: 2,
//         category_id: 1,
//       },
//       {
//         product_name: 'Áo Polo Nike Dri-FIT Victory',
//         slug: 'ao-polo-nike-dri-fit-victory',
//         description: 'Áo polo Nike Dri-FIT cho golf',
//         brand_id: 2,
//         category_id: 3,
//       },
//       {
//         product_name: 'Balo Nike Brasilia',
//         slug: 'balo-nike-brasilia',
//         description: 'Balo Nike Brasilia đa năng cho thể thao',
//         brand_id: 2,
//         category_id: 1,
//       },
//       {
//         product_name: 'Áo Thun Nữ Nike Sportswear Essential',
//         slug: 'ao-thun-nu-nike-sportswear-essential',
//         description: 'Áo thun nữ Nike Sportswear form rộng thoải mái',
//         brand_id: 2,
//         category_id: 6,
//       },
//       {
//         product_name: 'Quần Short Nữ Nike Tempo',
//         slug: 'quan-short-nu-nike-tempo',
//         description: 'Quần short chạy bộ Nike Tempo cho nữ',
//         brand_id: 2,
//         category_id: 8,
//       },
//       {
//         product_name: 'Giày Nike Pegasus 40',
//         slug: 'giay-nike-pegasus-40',
//         description: 'Giày chạy bộ Nike Air Zoom Pegasus 40',
//         brand_id: 2,
//         category_id: 1,
//       },
//       {
//         product_name: 'Áo Bra Nike Swoosh',
//         slug: 'ao-bra-nike-swoosh',
//         description: 'Áo bra thể thao Nike Swoosh hỗ trợ vừa',
//         brand_id: 2,
//         category_id: 2,
//       },
//       {
//         product_name: 'Túi Đeo Nike Heritage',
//         slug: 'tui-deo-nike-heritage',
//         description: 'Túi đeo chéo Nike Heritage nhỏ gọn',
//         brand_id: 2,
//         category_id: 1,
//       },
//       {
//         product_name: 'Áo Khoác Nike Therma-FIT',
//         slug: 'ao-khoac-nike-therma-fit',
//         description: 'Áo khoác Nike Therma-FIT giữ nhiệt',
//         brand_id: 2,
//         category_id: 1,
//       },
//       {
//         product_name: 'Giày Nike Cortez',
//         slug: 'giay-nike-cortez',
//         description: 'Giày Nike Cortez phong cách retro',
//         brand_id: 2,
//         category_id: 1,
//       },

//       // UNIQLO (brand_id: 3) - 20 sản phẩm
//       {
//         product_name: 'Áo Thun Uniqlo U',
//         slug: 'ao-thun-uniqlo-u',
//         description: 'Áo thun Uniqlo U thiết kế tối giản Nhật Bản',
//         brand_id: 3,
//         category_id: 3,
//       },
//       {
//         product_name: 'Áo Giữ Nhiệt Uniqlo Heattech',
//         slug: 'ao-giu-nhiet-uniqlo-heattech',
//         description: 'Áo giữ nhiệt Uniqlo Heattech công nghệ Nhật',
//         brand_id: 3,
//         category_id: 1,
//       },
//       {
//         product_name: 'Quần Jeans Uniqlo Slim Fit',
//         slug: 'quan-jeans-uniqlo-slim-fit',
//         description: 'Quần jeans Uniqlo Slim Fit co giãn thoải mái',
//         brand_id: 3,
//         category_id: 1,
//       },
//       {
//         product_name: 'Áo Khoác Uniqlo Ultra Light Down',
//         slug: 'ao-khoac-uniqlo-ultra-light-down',
//         description: 'Áo phao lông vũ Uniqlo siêu nhẹ',
//         brand_id: 3,
//         category_id: 1,
//       },
//       {
//         product_name: 'Áo Polo Uniqlo Dry',
//         slug: 'ao-polo-uniqlo-dry',
//         description: 'Áo polo Uniqlo Dry khô nhanh thoáng mát',
//         brand_id: 3,
//         category_id: 3,
//       },
//       {
//         product_name: 'Quần Short Uniqlo Dry-EX',
//         slug: 'quan-short-uniqlo-dry-ex',
//         description: 'Quần short Uniqlo Dry-EX cho thể thao',
//         brand_id: 3,
//         category_id: 5,
//       },
//       {
//         product_name: 'Áo Sơ Mi Uniqlo Oxford',
//         slug: 'ao-so-mi-uniqlo-oxford',
//         description: 'Áo sơ mi Uniqlo Oxford dài tay công sở',
//         brand_id: 3,
//         category_id: 4, // Áo sơ mi nam
//       },
//       {
//         product_name: 'Áo Len Uniqlo Extra Fine Merino',
//         slug: 'ao-len-uniqlo-extra-fine-merino',
//         description: 'Áo len Uniqlo len merino cao cấp',
//         brand_id: 3,
//         category_id: 1,
//       },
//       {
//         product_name: 'Quần Kaki Uniqlo Chino',
//         slug: 'quan-kaki-uniqlo-chino',
//         description: 'Quần kaki Uniqlo Chino form slim',
//         brand_id: 3,
//         category_id: 1,
//       },
//       {
//         product_name: 'Áo Thun Uniqlo AIRism',
//         slug: 'ao-thun-uniqlo-airism',
//         description: 'Áo thun Uniqlo AIRism mát lạnh mịn da',
//         brand_id: 3,
//         category_id: 3,
//       },
//       {
//         product_name: 'Áo Hoodie Uniqlo Sweat',
//         slug: 'ao-hoodie-uniqlo-sweat',
//         description: 'Áo hoodie Uniqlo Sweat chất liệu nỉ',
//         brand_id: 3,
//         category_id: 1,
//       },
//       {
//         product_name: 'Váy Uniqlo Rayon',
//         slug: 'vay-uniqlo-rayon',
//         description: 'Váy Uniqlo vải rayon mềm mại thoáng mát',
//         brand_id: 3,
//         category_id: 2,
//       },
//       {
//         product_name: 'Áo Thun Nữ Uniqlo Supima Cotton',
//         slug: 'ao-thun-nu-uniqlo-supima-cotton',
//         description: 'Áo thun nữ Uniqlo cotton Supima cao cấp',
//         brand_id: 3,
//         category_id: 6,
//       },
//       {
//         product_name: 'Quần Legging Uniqlo Heattech',
//         slug: 'quan-legging-uniqlo-heattech',
//         description: 'Quần legging giữ nhiệt Uniqlo Heattech',
//         brand_id: 3,
//         category_id: 2,
//       },
//       {
//         product_name: 'Áo Sơ Mi Nữ Uniqlo Rayon',
//         slug: 'ao-so-mi-nu-uniqlo-rayon',
//         description: 'Áo sơ mi nữ Uniqlo rayon mềm mịn',
//         brand_id: 3,
//         category_id: 7, // Áo sơ mi nữ
//       },
//       {
//         product_name: 'Áo Khoác Uniqlo Parka',
//         slug: 'ao-khoac-uniqlo-parka',
//         description: 'Áo khoác Uniqlo Parka chống gió mưa',
//         brand_id: 3,
//         category_id: 1,
//       },
//       {
//         product_name: 'Quần Short Nữ Uniqlo Cotton',
//         slug: 'quan-short-nu-uniqlo-cotton',
//         description: 'Quần short nữ Uniqlo cotton thoải mái',
//         brand_id: 3,
//         category_id: 8,
//       },
//       {
//         product_name: 'Áo Thun Uniqlo UT Graphic',
//         slug: 'ao-thun-uniqlo-ut-graphic',
//         description: 'Áo thun Uniqlo UT in hình nghệ thuật',
//         brand_id: 3,
//         category_id: 3,
//       },
//       {
//         product_name: 'Đầm Uniqlo Jersey',
//         slug: 'dam-uniqlo-jersey',
//         description: 'Đầm Uniqlo vải jersey co giãn thoải mái',
//         brand_id: 3,
//         category_id: 2,
//       },
//       {
//         product_name: 'Áo Cardigan Uniqlo Extra Fine Merino',
//         slug: 'ao-cardigan-uniqlo-extra-fine-merino',
//         description: 'Áo cardigan Uniqlo len merino mỏng nhẹ',
//         brand_id: 3,
//         category_id: 2,
//       },

//       // H&M (brand_id: 4) - 20 sản phẩm
//       {
//         product_name: 'Áo Thun H&M Basic',
//         slug: 'ao-thun-hm-basic',
//         description: 'Áo thun H&M Basic cotton cổ tròn',
//         brand_id: 4,
//         category_id: 3,
//       },
//       {
//         product_name: 'Quần Jeans H&M Skinny',
//         slug: 'quan-jeans-hm-skinny',
//         description: 'Quần jeans H&M Skinny Fit ôm dáng',
//         brand_id: 4,
//         category_id: 1,
//       },
//       {
//         product_name: 'Áo Sơ Mi H&M Slim Fit',
//         slug: 'ao-so-mi-hm-slim-fit',
//         description: 'Áo sơ mi H&M Slim Fit dài tay',
//         brand_id: 4,
//         category_id: 4,
//       },
//       {
//         product_name: 'Váy H&M Mini',
//         slug: 'vay-hm-mini',
//         description: 'Váy ngắn H&M phong cách trẻ trung',
//         brand_id: 4,
//         category_id: 2,
//       },
//       {
//         product_name: 'Áo Khoác Bomber H&M',
//         slug: 'ao-khoac-bomber-hm',
//         description: 'Áo khoác bomber H&M phong cách streetwear',
//         brand_id: 4,
//         category_id: 1,
//       },
//       {
//         product_name: 'Quần Short H&M Chino',
//         slug: 'quan-short-hm-chino',
//         description: 'Quần short kaki H&M Chino năng động',
//         brand_id: 4,
//         category_id: 5,
//       },
//       {
//         product_name: 'Áo Hoodie H&M Regular Fit',
//         slug: 'ao-hoodie-hm-regular-fit',
//         description: 'Áo hoodie H&M Regular Fit có nón',
//         brand_id: 4,
//         category_id: 1,
//       },
//       {
//         product_name: 'Đầm H&M Midi',
//         slug: 'dam-hm-midi',
//         description: 'Đầm H&M dài qua gối thanh lịch',
//         brand_id: 4,
//         category_id: 2,
//       },
//       {
//         product_name: 'Áo Thun Nữ H&M Crop Top',
//         slug: 'ao-thun-nu-hm-crop-top',
//         description: 'Áo thun nữ H&M crop top ngắn',
//         brand_id: 4,
//         category_id: 6,
//       },
//       {
//         product_name: 'Quần Jogger H&M',
//         slug: 'quan-jogger-hm',
//         description: 'Quần jogger H&M thun gân thoải mái',
//         brand_id: 4,
//         category_id: 1,
//       },
//       {
//         product_name: 'Áo Len H&M',
//         slug: 'ao-len-hm',
//         description: 'Áo len H&M cổ tròn ấm áp',
//         brand_id: 4,
//         category_id: 1,
//       },
//       {
//         product_name: 'Quần Jeans Nữ H&M Mom Fit',
//         slug: 'quan-jeans-nu-hm-mom-fit',
//         description: 'Quần jeans nữ H&M Mom Fit ống rộng',
//         brand_id: 4,
//         category_id: 2,
//       },
//       {
//         product_name: 'Áo Blazer H&M',
//         slug: 'ao-blazer-hm',
//         description: 'Áo blazer H&M công sở thanh lịch',
//         brand_id: 4,
//         category_id: 1,
//       },
//       {
//         product_name: 'Áo Tank Top H&M',
//         slug: 'ao-tank-top-hm',
//         description: 'Áo ba lỗ H&M cotton thoáng mát',
//         brand_id: 4,
//         category_id: 3,
//       },
//       {
//         product_name: 'Quần Legging H&M',
//         slug: 'quan-legging-hm',
//         description: 'Quần legging H&M co giãn tập yoga',
//         brand_id: 4,
//         category_id: 2,
//       },
//       {
//         product_name: 'Áo Polo H&M',
//         slug: 'ao-polo-hm',
//         description: 'Áo polo H&M pique cotton cổ điển',
//         brand_id: 4,
//         category_id: 3,
//       },
//       {
//         product_name: 'Quần Short Nữ H&M Denim',
//         slug: 'quan-short-nu-hm-denim',
//         description: 'Quần short jeans nữ H&M rách nhẹ',
//         brand_id: 4,
//         category_id: 8,
//       },
//       {
//         product_name: 'Áo Sơ Mi Nữ H&M',
//         slug: 'ao-so-mi-nu-hm',
//         description: 'Áo sơ mi nữ H&M vải lụa mềm mại',
//         brand_id: 4,
//         category_id: 7,
//       },
//       {
//         product_name: 'Áo Khoác Jeans H&M',
//         slug: 'ao-khoac-jeans-hm',
//         description: 'Áo khoác jeans H&M denim wash',
//         brand_id: 4,
//         category_id: 1,
//       },
//       {
//         product_name: 'Chân Váy H&M Pleat',
//         slug: 'chan-vay-hm-pleat',
//         description: 'Chân váy H&M xếp ly dài',
//         brand_id: 4,
//         category_id: 2,
//       },

//       // ZARA (brand_id: 5) - 15 sản phẩm
//       {
//         product_name: 'Áo Blazer Zara Oversize',
//         slug: 'ao-blazer-zara-oversize',
//         description: 'Áo blazer Zara form oversize thời thượng',
//         brand_id: 5,
//         category_id: 1,
//       },
//       {
//         product_name: 'Quần Jeans Zara Wide Leg',
//         slug: 'quan-jeans-zara-wide-leg',
//         description: 'Quần jeans Zara ống rộng cao cấp',
//         brand_id: 5,
//         category_id: 1,
//       },
//       {
//         product_name: 'Áo Sơ Mi Zara Linen',
//         slug: 'ao-so-mi-zara-linen',
//         description: 'Áo sơ mi Zara vải linen thoáng mát',
//         brand_id: 5,
//         category_id: 4,
//       },
//       {
//         product_name: 'Váy Zara Midi Satin',
//         slug: 'vay-zara-midi-satin',
//         description: 'Váy Zara vải satin lụa sang trọng',
//         brand_id: 5,
//         category_id: 2,
//       },
//       {
//         product_name: 'Áo Thun Zara Basic',
//         slug: 'ao-thun-zara-basic',
//         description: 'Áo thun Zara Basic cổ tròn đơn giản',
//         brand_id: 5,
//         category_id: 3,
//       },
//       {
//         product_name: 'Quần Tây Zara Suit',
//         slug: 'quan-tay-zara-suit',
//         description: 'Quần tây Zara Suit công sở lịch sự',
//         brand_id: 5,
//         category_id: 1,
//       },
//       {
//         product_name: 'Áo Khoác Zara Leather',
//         slug: 'ao-khoac-zara-leather',
//         description: 'Áo khoác da Zara phong cách biker',
//         brand_id: 5,
//         category_id: 1,
//       },
//       {
//         product_name: 'Đầm Zara Mini Cut Out',
//         slug: 'dam-zara-mini-cut-out',
//         description: 'Đầm Zara mini cắt xẻ độc đáo',
//         brand_id: 5,
//         category_id: 2,
//       },
//       {
//         product_name: 'Áo Cardigan Zara Knit',
//         slug: 'ao-cardigan-zara-knit',
//         description: 'Áo cardigan Zara dệt kim mềm mại',
//         brand_id: 5,
//         category_id: 2,
//       },
//       {
//         product_name: 'Quần Short Zara Bermuda',
//         slug: 'quan-short-zara-bermuda',
//         description: 'Quần short Zara Bermuda dài qua gối',
//         brand_id: 5,
//         category_id: 5,
//       },
//       {
//         product_name: 'Áo Crop Top Zara',
//         slug: 'ao-crop-top-zara',
//         description: 'Áo crop top Zara thiết kế trẻ trung',
//         brand_id: 5,
//         category_id: 6,
//       },
//       {
//         product_name: 'Quần Jeans Nữ Zara Straight',
//         slug: 'quan-jeans-nu-zara-straight',
//         description: 'Quần jeans nữ Zara ống đứng vintage',
//         brand_id: 5,
//         category_id: 2,
//       },
//       {
//         product_name: 'Áo Sơ Mi Nữ Zara Poplin',
//         slug: 'ao-so-mi-nu-zara-poplin',
//         description: 'Áo sơ mi nữ Zara poplin trắng công sở',
//         brand_id: 5,
//         category_id: 7,
//       },
//       {
//         product_name: 'Quần Short Nữ Zara High Waist',
//         slug: 'quan-short-nu-zara-high-waist',
//         description: 'Quần short nữ Zara lưng cao thời trang',
//         brand_id: 5,
//         category_id: 8,
//       },
//       {
//         product_name: 'Áo Khoác Zara Trench Coat',
//         slug: 'ao-khoac-zara-trench-coat',
//         description: 'Áo khoác Zara Trench Coat dài thanh lịch',
//         brand_id: 5,
//         category_id: 2,
//       },
//       {
//         product_name: 'adidas Adicolor Classics Trefoil Tee (Men)',
//         slug: 'adidas-adicolor-classics-trefoil-tee-men',
//         description: 'Áo thun adidas Originals Adicolor Trefoil, cotton, logo Trefoil.',
//         brand_id: 1,
//         category_id: 3,
//       },
//       {
//         product_name: 'adidas Adicolor Classics 3-Stripes Tee (Men)',
//         slug: 'adidas-adicolor-classics-3-stripes-tee-men',
//         description: 'Áo thun adidas Originals 3-Sọc kinh điển, chất liệu cotton.',
//         brand_id: 1,
//         category_id: 3,
//       },
//       {
//         product_name: 'adidas Essentials 3-Stripes Tee (Men)',
//         slug: 'adidas-essentials-3-stripes-tee-men',
//         description: 'Áo thun adidas Essentials 3-Sọc dễ phối, mặc hàng ngày.',
//         brand_id: 1,
//         category_id: 3,
//       },
//       {
//         product_name: 'adidas AEROREADY Designed to Move Feelready Sport Tee (Men)',
//         slug: 'adidas-aeroready-designed-to-move-feelready-sport-tee-men',
//         description: 'Áo tập AEROREADY thấm hút, thoáng mát khi vận động.',
//         brand_id: 1,
//         category_id: 3,
//       },
//       {
//         product_name: 'adidas Future Icons 3-Stripes Tee (Men)',
//         slug: 'adidas-future-icons-3-stripes-tee-men',
//         description: 'Áo thun Future Icons, 3-Sọc quấn tay hiện đại.',
//         brand_id: 1,
//         category_id: 3,
//       },

//       // Áo thun nữ (cat 6)
//       {
//         product_name: 'adidas Adicolor Classics Trefoil Tee (Women)',
//         slug: 'adidas-adicolor-classics-trefoil-tee-women',
//         description: 'Áo thun nữ adidas Originals Trefoil, phom thoải mái.',
//         brand_id: 1,
//         category_id: 6,
//       },
//       {
//         product_name: 'adidas Essentials Slim 3-Stripes Tee (Women)',
//         slug: 'adidas-essentials-slim-3-stripes-tee-women',
//         description: 'Áo thun nữ Essentials 3-Sọc, dáng slim fit.',
//         brand_id: 1,
//         category_id: 6,
//       },
//       {
//         product_name: 'adidas Future Icons 3-Stripes Tee (Women)',
//         slug: 'adidas-future-icons-3-stripes-tee-women',
//         description: 'Áo thun nữ Future Icons 3-Sọc, cotton jersey.',
//         brand_id: 1,
//         category_id: 6,
//       },
//       {
//         product_name: 'adidas Modern Essentials Graphic Tee (Women)',
//         slug: 'adidas-modern-essentials-graphic-tee-women',
//         description: 'Áo thun nữ Modern Essentials in graphic tối giản.',
//         brand_id: 1,
//         category_id: 6,
//       },

//       // Quần short nam (cat 5)
//       {
//         product_name: 'adidas AEROREADY Essentials Chelsea 3-Stripes Shorts (Men)',
//         slug: 'adidas-aeroready-essentials-chelsea-3-stripes-shorts-men',
//         description: 'Quần short AEROREADY Chelsea 3-Sọc, nhanh khô.',
//         brand_id: 1,
//         category_id: 5,
//       },
//       {
//         product_name: 'adidas Adicolor Classics Sprinter Shorts (Men)',
//         slug: 'adidas-adicolor-classics-sprinter-shorts-men',
//         description: 'Short adidas Originals Adicolor Sprinter, retro.',
//         brand_id: 1,
//         category_id: 5,
//       },
//       {
//         product_name: 'adidas Essentials 3-Stripes Cotton Shorts (Men)',
//         slug: 'adidas-essentials-3-stripes-cotton-shorts-men',
//         description: 'Short cotton adidas Essentials 3-Sọc, mặc hằng ngày.',
//         brand_id: 1,
//         category_id: 5,
//       },

//       // Quần short nữ (cat 8)
//       {
//         product_name: 'adidas Adicolor 3-Stripes Sprinter Shorts (Women)',
//         slug: 'adidas-adicolor-3-stripes-sprinter-shorts-women',
//         description: 'Short nữ Adicolor 3-Sọc, phong cách Originals.',
//         brand_id: 1,
//         category_id: 8,
//       },
//       {
//         product_name: 'adidas Firebird Shorts (Women)',
//         slug: 'adidas-firebird-shorts-women',
//         description: 'Short nữ Firebird, chất liệu nhẹ, nhiều màu.',
//         brand_id: 1,
//         category_id: 8,
//       },
//       {
//         product_name: 'adidas Essentials Slim 3-Stripes Shorts (Women)',
//         slug: 'adidas-essentials-slim-3-stripes-shorts-women',
//         description: 'Short nữ Essentials 3-Sọc dáng slim, dễ phối.',
//         brand_id: 1,
//         category_id: 8,
//       },
//       {
//         product_name: 'Nike Sportswear Club T‑Shirt (Men)',
//         slug: 'nike-sportswear-club-t-shirt-men',
//         description: 'Áo thun Nike Sportswear Club, cơ bản, dễ phối.',
//         brand_id: 2,
//         category_id: 3,
//       },
//       {
//         product_name: 'Nike Dri‑FIT Legend Fitness T‑Shirt (Men)',
//         slug: 'nike-dri-fit-legend-t-shirt-men',
//         description: 'Áo tập Dri‑FIT Legend, thoát mồ hôi nhanh.',
//         brand_id: 2,
//         category_id: 3,
//       },
//       {
//         product_name: 'Nike Miler Dri‑FIT UV Running Top (Men)',
//         slug: 'nike-miler-dri-fit-uv-top-men',
//         description: 'Áo chạy bộ Nike Miler Dri‑FIT UV, siêu nhẹ.',
//         brand_id: 2,
//         category_id: 3,
//       },
//       {
//         product_name: 'Nike Pro Dri‑FIT Short‑Sleeve Top (Men)',
//         slug: 'nike-pro-dri-fit-top-men',
//         description: 'Áo tập Nike Pro Dri‑FIT, co giãn, thoáng mát.',
//         brand_id: 2,
//         category_id: 3,
//       },

//       // Áo thun nữ (cat 6)
//       {
//         product_name: 'Nike Sportswear Essential T‑Shirt (Women)',
//         slug: 'nike-sportswear-essential-t-shirt-women',
//         description: 'Áo thun nữ Nike Sportswear Essential basic.',
//         brand_id: 2,
//         category_id: 6,
//       },
//       {
//         product_name: 'Nike One Dri‑FIT Short‑Sleeve Top (Women)',
//         slug: 'nike-one-dri-fit-short-sleeve-top-women',
//         description: 'Áo nữ Nike One Dri‑FIT, chất liệu thấm hút.',
//         brand_id: 2,
//         category_id: 6,
//       },
//       {
//         product_name: 'Nike One Classic Dri‑FIT Short‑Sleeve Top (Women)',
//         slug: 'nike-one-classic-dri-fit-short-sleeve-top-women',
//         description: 'Áo nữ Nike One Classic, vải Dri‑FIT thoáng.',
//         brand_id: 2,
//         category_id: 6,
//       },

//       // Quần short nam (cat 5)
//       {
//         product_name: 'Nike Club Woven Flow Shorts (Men)',
//         slug: 'nike-club-woven-flow-shorts-men',
//         description: 'Short vải dệt Nike Club Woven Flow, lót mesh.',
//         brand_id: 2,
//         category_id: 5,
//       },
//       {
//         product_name: 'Nike Stride Dri‑FIT 18cm Brief‑Lined Running Shorts (Men)',
//         slug: 'nike-stride-dri-fit-18cm-brief-lined-shorts-men',
//         description: 'Short chạy bộ Nike Stride Dri‑FIT, lót brief.',
//         brand_id: 2,
//         category_id: 5,
//       },
//       {
//         product_name: 'Nike Challenger Dri‑FIT 7" Brief‑Lined Running Shorts (Men)',
//         slug: 'nike-challenger-dri-fit-7in-brief-lined-shorts-men',
//         description: 'Short Nike Challenger Dri‑FIT 7 inch có lót.',
//         brand_id: 2,
//         category_id: 5,
//       },
//       {
//         product_name: 'Nike Club Fleece Shorts (Men)',
//         slug: 'nike-club-fleece-shorts-men',
//         description: 'Short nỉ Nike Club Fleece, thoải mái hàng ngày.',
//         brand_id: 2,
//         category_id: 5,
//       },

//       // Quần short nữ (cat 8)
//       {
//         product_name: 'Nike One Dri‑FIT Loose 7.5cm Brief‑Lined Shorts (Women)',
//         slug: 'nike-one-dri-fit-loose-7-5cm-brief-lined-shorts-women',
//         description: 'Short nữ Nike One Dri‑FIT Loose có lót.',
//         brand_id: 2,
//         category_id: 8,
//       },
//       {
//         product_name: 'Nike Tempo Dri‑FIT Mid‑Rise Running Shorts (Women)',
//         slug: 'nike-tempo-dri-fit-running-shorts-women',
//         description: 'Short chạy bộ nữ Nike Tempo Dri‑FIT cổ điển.',
//         brand_id: 2,
//         category_id: 8,
//       },
//       {
//         product_name: 'Nike Sportswear Club Fleece Mid‑Rise Shorts (Women)',
//         slug: 'nike-sportswear-club-fleece-mid-rise-shorts-women',
//         description: 'Short nữ Nike Club Fleece mid‑rise, mềm mại.',
//         brand_id: 2,
//         category_id: 8,
//       },
//       {
//         product_name: 'Nike Swift Dri‑FIT 2‑in‑1 Running Shorts (Women)',
//         slug: 'nike-swift-dri-fit-2-in-1-running-shorts-women',
//         description: 'Short nữ Nike Swift Dri‑FIT 2 lớp, nhiều túi.',
//         brand_id: 2,
//         category_id: 8,
//       },
//       {
//         product_name: 'UNIQLO U Crew Neck Short‑Sleeve T‑Shirt (Men)',
//         slug: 'uniqlo-u-crew-neck-short-sleeve-t-shirt-men',
//         description: 'Áo thun Uniqlo U cổ tròn, phom chuẩn, chất cotton.',
//         brand_id: 3,
//         category_id: 3,
//       },
//       {
//         product_name: 'UNIQLO Supima Cotton Crew Neck Short‑Sleeve T‑Shirt (Men)',
//         slug: 'uniqlo-supima-cotton-crew-neck-short-sleeve-t-shirt-men',
//         description: 'Áo thun Supima Cotton mềm mịn, bền màu.',
//         brand_id: 3,
//         category_id: 3,
//       },
//       {
//         product_name: 'UNIQLO AIRism Cotton Oversized Crew Neck T‑Shirt (Men)',
//         slug: 'uniqlo-airism-cotton-oversized-crew-neck-t-shirt-men',
//         description: 'Áo thun AIRism Cotton Oversized, khô thoáng.',
//         brand_id: 3,
//         category_id: 3,
//       },
//       {
//         product_name: 'UNIQLO DRY‑EX Short‑Sleeve T‑Shirt (Men)',
//         slug: 'uniqlo-dry-ex-short-sleeve-t-shirt-men',
//         description: 'Áo DRY‑EX nhanh khô, thoáng khí cho tập luyện.',
//         brand_id: 3,
//         category_id: 3,
//       },

//       // Áo thun nữ (cat 6)
//       {
//         product_name: 'UNIQLO AIRism Cotton T‑Shirt (Women)',
//         slug: 'uniqlo-airism-cotton-t-shirt-women',
//         description: 'Áo nữ AIRism Cotton, mát và mềm.',
//         brand_id: 3,
//         category_id: 6,
//       },
//       {
//         product_name: 'UNIQLO AIRism Seamless T‑Shirt (Women)',
//         slug: 'uniqlo-airism-seamless-t-shirt-women',
//         description: 'Áo nữ AIRism Seamless, ít đường may, thoải mái.',
//         brand_id: 3,
//         category_id: 6,
//       },
//       {
//         product_name: 'UNIQLO AIRism Soft Ribbed Sleeveless Top (Women)',
//         slug: 'uniqlo-airism-soft-ribbed-sleeveless-top-women',
//         description: 'Áo nữ AIRism gân mềm, thoáng, không tay.',
//         brand_id: 3,
//         category_id: 6,
//       },

//       // Áo sơ mi nam (cat 4)
//       {
//         product_name: 'UNIQLO Oxford Slim‑Fit Long‑Sleeve Shirt (Men)',
//         slug: 'uniqlo-oxford-slim-fit-long-sleeve-shirt-men',
//         description: 'Sơ mi Oxford slim fit, dễ phối công sở.',
//         brand_id: 3,
//         category_id: 4,
//       },
//       {
//         product_name: 'UNIQLO 100% European Premium Linen Long‑Sleeve Shirt (Men)',
//         slug: 'uniqlo-100-european-premium-linen-long-sleeve-shirt-men',
//         description: 'Sơ mi linen châu Âu 100%, mát và sang.',
//         brand_id: 3,
//         category_id: 4,
//       },
//       {
//         product_name: 'UNIQLO Cotton Linen Open Collar Shirt (Men)',
//         slug: 'uniqlo-cotton-linen-open-collar-shirt-men',
//         description: 'Sơ mi cổ mở cotton‑linen, thoáng nhẹ ngày hè.',
//         brand_id: 3,
//         category_id: 4,
//       },
//       {
//         product_name: 'UNIQLO Extra Fine Cotton Broadcloth Long‑Sleeve Shirt (Men)',
//         slug: 'uniqlo-extra-fine-cotton-broadcloth-long-sleeve-shirt-men',
//         description: 'Sơ mi broadcloth cotton mịn, phẳng phiu.',
//         brand_id: 3,
//         category_id: 4,
//       },

//       // Áo sơ mi nữ (cat 7)
//       {
//         product_name: 'UNIQLO Premium Linen Long‑Sleeve Shirt (Women)',
//         slug: 'uniqlo-premium-linen-long-sleeve-shirt-women',
//         description: 'Sơ mi nữ linen cao cấp, thoáng mát.',
//         brand_id: 3,
//         category_id: 7,
//       },
//       {
//         product_name: 'UNIQLO Linen Blend Open Collar Short‑Sleeve Shirt (Women)',
//         slug: 'uniqlo-linen-blend-open-collar-short-sleeve-shirt-women',
//         description: 'Sơ mi cổ mở nữ pha linen, nhẹ và mát.',
//         brand_id: 3,
//         category_id: 7,
//       },

//       // Quần short (nam/nữ)
//       {
//         product_name: 'UNIQLO Chino Shorts (Men)',
//         slug: 'uniqlo-chino-shorts-men',
//         description: 'Quần short chino nam, form gọn, nhiều màu cơ bản.',
//         brand_id: 3,
//         category_id: 5,
//       },
//       {
//         product_name: 'UNIQLO Ultra Stretch Active Shorts (Women)',
//         slug: 'uniqlo-ultra-stretch-active-shorts-women',
//         description: 'Short nữ Ultra Stretch Active, co giãn thoải mái.',
//         brand_id: 3,
//         category_id: 8,
//       },
//       {
//         product_name: 'H&M Regular Fit T‑Shirt (Men)',
//         slug: 'hm-regular-fit-t-shirt-men',
//         description: 'Áo thun nam Regular Fit, cotton cơ bản.',
//         brand_id: 4,
//         category_id: 3,
//       },
//       {
//         product_name: 'H&M Oversized Fit Tee (Men)',
//         slug: 'hm-oversized-fit-tee-men',
//         description: 'Áo thun nam Oversized Fit, phom rộng xu hướng.',
//         brand_id: 4,
//         category_id: 3,
//       },
//       {
//         product_name: 'H&M Oversized Fit Printed T‑Shirt (Men)',
//         slug: 'hm-oversized-fit-printed-t-shirt-men',
//         description: 'Áo thun đồ họa Oversized, chất jersey nặng.',
//         brand_id: 4,
//         category_id: 3,
//       },

//       // Áo sơ mi nam (cat 4)
//       {
//         product_name: 'H&M Regular Fit Oxford Shirt (Men)',
//         slug: 'hm-regular-fit-oxford-shirt-men',
//         description: 'Sơ mi Oxford nam Regular Fit, cổ button‑down.',
//         brand_id: 4,
//         category_id: 4,
//       },
//       {
//         product_name: 'H&M Relaxed Fit Linen Blend Shirt (Men)',
//         slug: 'hm-relaxed-fit-linen-blend-shirt-men',
//         description: 'Sơ mi linen‑blend relaxed fit, thoáng nhẹ.',
//         brand_id: 4,
//         category_id: 4,
//       },
//       {
//         product_name: 'H&M Linen Resort Shirt (Men)',
//         slug: 'hm-linen-resort-shirt-men',
//         description: 'Sơ mi linen cổ resort tay ngắn, mát hè.',
//         brand_id: 4,
//         category_id: 4,
//       },
//       {
//         product_name: 'H&M Oversized Fit Seersucker Shirt (Men)',
//         slug: 'hm-oversized-fit-seersucker-shirt-men',
//         description: 'Sơ mi seersucker oversized, nhẹ & nhăn đẹp.',
//         brand_id: 4,
//         category_id: 4,
//       },

//       // Quần short nam (cat 5)
//       {
//         product_name: 'H&M Regular Fit Twill Shorts (Men)',
//         slug: 'hm-regular-fit-twill-shorts-men',
//         description: 'Quần short twill/cotton, dáng regular fit.',
//         brand_id: 4,
//         category_id: 5,
//       },

//       // Áo thun nữ (cat 6)
//       {
//         product_name: 'H&M Cotton T‑Shirt (Women)',
//         slug: 'hm-cotton-t-shirt-women',
//         description: 'Áo thun nữ cotton cơ bản nhiều màu.',
//         brand_id: 4,
//         category_id: 6,
//       },
//       {
//         product_name: 'H&M Oversized T‑Shirt (Women)',
//         slug: 'hm-oversized-t-shirt-women',
//         description: 'Áo thun nữ oversized, thoải mái dễ phối.',
//         brand_id: 4,
//         category_id: 6,
//       },
//       {
//         product_name: 'H&M Basic T‑Shirt (Women)',
//         slug: 'hm-basic-t-shirt-women',
//         description: 'Dòng basics nữ của H&M, đa dạng kiểu dáng.',
//         brand_id: 4,
//         category_id: 6,
//       },

//       // Áo sơ mi nữ (cat 7)
//       {
//         product_name: 'H&M Linen Shirt (Women)',
//         slug: 'hm-linen-shirt-women',
//         description: 'Sơ mi nữ linen, nhẹ & thoáng, mặc hè.',
//         brand_id: 4,
//         category_id: 7,
//       },
//       {
//         product_name: 'H&M Linen Blend Shirt (Women)',
//         slug: 'hm-linen-blend-shirt-women',
//         description: 'Sơ mi nữ linen‑blend, phom thoải mái.',
//         brand_id: 4,
//         category_id: 7,
//       },

//       // Quần short nữ (cat 8)
//       {
//         product_name: 'H&M Linen Shorts (Women)',
//         slug: 'hm-linen-shorts-women',
//         description: 'Short nữ linen/cotton cho mùa hè.',
//         brand_id: 4,
//         category_id: 8,
//       },
//       {
//         product_name: 'ZARA Basic Slim Fit T‑Shirt (Men)',
//         slug: 'zara-basic-slim-fit-t-shirt-men',
//         description: 'Áo thun basic slim fit, vải cotton co giãn.',
//         brand_id: 5,
//         category_id: 3,
//       },
//       {
//         product_name: 'ZARA Basic T‑Shirt (Men)',
//         slug: 'zara-basic-t-shirt-men',
//         description: 'Áo thun nam basic, nhiều màu cơ bản.',
//         brand_id: 5,
//         category_id: 3,
//       },
//       {
//         product_name: 'ZARA Short‑Sleeve T‑Shirts (Men)',
//         slug: 'zara-short-sleeve-t-shirts-men',
//         description: 'BST áo thun tay ngắn nam của ZARA.',
//         brand_id: 5,
//         category_id: 3,
//       },

//       // Áo sơ mi nam (cat 4)
//       {
//         product_name: 'ZARA 100% Linen Shirt (Men)',
//         slug: 'zara-100-linen-shirt-men',
//         description: 'Sơ mi linen 100%, mát mẻ và thanh lịch.',
//         brand_id: 5,
//         category_id: 4,
//       },
//       {
//         product_name: 'ZARA Linen Blend Shirt (Men)',
//         slug: 'zara-linen-blend-shirt-men',
//         description: 'Sơ mi pha linen dễ mặc ngày hè.',
//         brand_id: 5,
//         category_id: 4,
//       },
//       {
//         product_name: 'ZARA Timeless 100% Linen Plain Shirt (Men)',
//         slug: 'zara-timeless-100-linen-plain-shirt-men',
//         description: 'Sơ mi linen dòng Timeless, tối giản.',
//         brand_id: 5,
//         category_id: 4,
//       },

//       // Quần short nam (cat 5)
//       {
//         product_name: 'ZARA Straight Fit Textured Bermuda Shorts (Men)',
//         slug: 'zara-straight-fit-textured-bermuda-shorts-men',
//         description: 'Bermuda dệt họa tiết, cạp thun dây rút.',
//         brand_id: 5,
//         category_id: 5,
//       },

//       // Áo thun nữ (cat 6)
//       {
//         product_name: 'ZARA Women Basic Short Sleeve T‑Shirt',
//         slug: 'zara-women-basic-short-sleeve-t-shirt',
//         description: 'Áo thun nữ basic tay ngắn, nhiều màu.',
//         brand_id: 5,
//         category_id: 6,
//       },
//       {
//         product_name: 'ZARA Women Basic T‑Shirts Collection',
//         slug: 'zara-women-basic-t-shirts-collection',
//         description: 'Danh mục áo thun basic nữ Zara, dễ phối đồ.',
//         brand_id: 5,
//         category_id: 6,
//       },
//       {
//         product_name: 'ZARA Women T‑Shirts (General)',
//         slug: 'zara-women-tshirts-general',
//         description: 'Bộ sưu tập áo thun nữ đa dạng kiểu.',
//         brand_id: 5,
//         category_id: 6,
//       },

//       // Áo sơ mi nữ (cat 7)
//       {
//         product_name: 'ZARA 100% Linen Shirt (Women)',
//         slug: 'zara-100-linen-shirt-women',
//         description: 'Sơ mi nữ 100% linen, thoáng và sang.',
//         brand_id: 5,
//         category_id: 7,
//       },
//       {
//         product_name: 'ZARA Wide‑Sleeve Linen Blend Shirt (Women)',
//         slug: 'zara-wide-sleeve-linen-blend-shirt-women',
//         description: 'Sơ mi nữ pha linen tay rộng, cài nút trước.',
//         brand_id: 5,
//         category_id: 7,
//       },

//       // Quần short nữ (cat 8)
//       {
//         product_name: 'ZARA Long Bermuda Shorts (Women)',
//         slug: 'zara-long-bermuda-shorts-women',
//         description: 'Bermuda nữ cạp vừa, ống dài, có túi.',
//         brand_id: 5,
//         category_id: 8,
//       },
//       {
//         product_name: 'ZARA Elasticated Bermuda Shorts (Women)',
//         slug: 'zara-elasticated-bermuda-shorts-women',
//         description: 'Bermuda nữ lưng thun, dây rút thoải mái.',
//         brand_id: 5,
//         category_id: 8,
//       },
//     ],
//   });
//   console.log('✅ Done seeding products.');

//   // ================================
//   // 10. Product Variants (màu × size; 3–4 size/sản phẩm)
//   // ================================
//   console.log('🏷️  Seeding product variants (1 màu × nhiều size)...');

//   type Gender = 'male' | 'female';

//   const TOP_CATS = new Set<number>([3, 4, 6, 7]); // áo nam/nữ
//   const SHORTS_CATS = new Set<number>([5, 8]); // quần short nam/nữ

//   // Default giá / màu (đổi nếu muốn)
//   const DEFAULT_COLOR = 'Black';
//   const DEFAULT_COST = 200000;
//   const DEFAULT_BASE = 450000;
//   const DEFAULT_QTY = 50;

//   // Map brand_id -> SLUG UPPER (để sinh SKU đẹp) – có type guard tránh null
//   const brandSlugUpper = new Map<number, string>();
//   for (const b of brands) {
//     if (typeof b?.brand_id === 'number') {
//       brandSlugUpper.set(b.brand_id, String(b.slug ?? 'BRAND').toUpperCase());
//     }
//   }

//   // ==== Lấy và lập chỉ mục sizes (bỏ những dòng có brand_id null) ====
//   const allSizesRaw = await prisma.sizes.findMany({
//     select: { size_id: true, brand_id: true, gender: true, size_label: true },
//   });
//   type SizeRow = { size_id: number; brand_id: number | null; gender: Gender; size_label: string };
//   const allSizes = allSizesRaw as SizeRow[];

//   const makeKey = (brandId: number, gender: Gender, label: string) =>
//     `${brandId}|${gender}|${label}`;

//   const sizeIndex = new Map<string, number>(); // key -> size_id
//   const sizeIdToLabel = new Map<number, string>(); // size_id -> label

//   for (const s of allSizes) {
//     if (s.brand_id == null) continue; // tránh lỗi number|null
//     sizeIndex.set(makeKey(s.brand_id, s.gender, s.size_label), s.size_id);
//     sizeIdToLabel.set(s.size_id, s.size_label);
//   }

//   // ==== Lấy danh sách product cần tạo variant, lọc bỏ null để chắc kiểu ====
//   const targetProductsRaw = await prisma.products.findMany({
//     where: {
//       category_id: { in: [3, 4, 5, 6, 7, 8] },
//       brand_id: { not: null },
//       slug: { not: null },
//     },
//     select: { product_id: true, brand_id: true, category_id: true, slug: true },
//   });

//   type ProductRow = { product_id: number; brand_id: number; category_id: number; slug: string };
//   const targetProducts: ProductRow[] = (targetProductsRaw as any[]).filter(
//     (p): p is ProductRow =>
//       typeof p?.product_id === 'number' &&
//       typeof p?.brand_id === 'number' &&
//       typeof p?.category_id === 'number' &&
//       typeof p?.slug === 'string',
//   );

//   // ==== Chọn size theo loại sản phẩm ====
//   const topSizeLabels: string[] = ['S', 'M', 'L']; // thêm 'XL' nếu muốn 4 size áo
//   const shortSizeLabels: string[] = Array.from({ length: 9 }, (_, i) => String(27 + i)); // '27'..'35'

//   for (const p of targetProducts) {
//     const isTop = TOP_CATS.has(p.category_id);
//     const isShort = SHORTS_CATS.has(p.category_id);
//     if (!isTop && !isShort) continue;

//     const gender: Gender = [3, 4, 5].includes(p.category_id) ? 'male' : 'female';
//     const labels = isTop ? topSizeLabels : shortSizeLabels;

//     // Tìm size_id tương ứng (brand + gender + label)
//     const needSizeIds: number[] = [];
//     for (const label of labels) {
//       const sid = sizeIndex.get(makeKey(p.brand_id, gender, label)); // number | undefined
//       if (typeof sid === 'number') needSizeIds.push(sid); // type guard rõ ràng
//     }
//     if (needSizeIds.length === 0) continue;

//     // Tạo variants: 1 màu BLACK × nhiều size (tránh trùng)
//     for (const sid of needSizeIds) {
//       const label = sizeIdToLabel.get(sid) ?? '';
//       if (!label) continue;

//       const sku =
//         `${brandSlugUpper.get(p.brand_id) || 'BRAND'}-${p.slug.toUpperCase()}-BLK-${label}`
//           .replace(/[^A-Z0-9-]/g, '-') // gạn ký tự lạ
//           .replace(/--+/g, '-'); // gộp dấu '-'

//       const existed = await prisma.product_variants.findFirst({
//         where: { product_id: p.product_id, size_id: sid },
//         select: { variant_id: true },
//       });
//       if (existed) continue;

//       await prisma.product_variants.create({
//         data: {
//           product_id: p.product_id,
//           size_id: sid,
//           sku,
//           cost_price: DEFAULT_COST,
//           base_price: DEFAULT_BASE,
//           quantity: DEFAULT_QTY,
//           status: true,
//           attribute: {
//             color: DEFAULT_COLOR,
//             size: label,
//             gender: gender === 'male' ? 'Men' : 'Women',
//             images: null, // ảnh để null để bạn tự thêm
//           },
//         },
//       });
//     }
//   }

//   console.log('✅ Done: mỗi product đã có 1 màu (Black) × nhiều size (áo: S/M/L; quần: 27–35).');

//   // ================================
//   // 11. Vouchers
//   // ================================
//   console.log('🎟️  Seeding vouchers...');
//   await prisma.vouchers.createMany({
//     data: [
//       {
//         title: 'Giam10',
//         description: 'Giảm 10% đơn từ 300k',
//         discount_type: 'percent',
//         discount_value: 10,
//         min_order_value: 300000,
//         max_discount: 50000,
//         quantity: 100,
//       },
//       {
//         title: 'Tru50000',
//         description: 'Giảm 50k đơn từ 400k',
//         discount_type: 'fixed',
//         discount_value: 50000,
//         min_order_value: 400000,
//         max_discount: 50000,
//         quantity: 50,
//       },
//     ],
//   });

//   // ================================
//   // 12. Site Contents (FAQ, Policies)
//   // ================================
//   console.log('📄 Seeding site_contents (FAQ, Policies)...');

//   const siteContents = [
//     // FAQ
//     {
//       slug: 'faq-shipping-time',
//       title: 'Thời gian giao hàng bao lâu?',
//       content: `Chúng tôi cung cấp giao hàng miễn phí cho các đơn hàng từ 100,000 VND.

// Thời gian giao hàng:
// - Hà Nội & TP.HCM: 2-3 ngày làm việc
// - Các tỉnh khác: 3-5 ngày làm việc
// - Giao hàng ngoài giờ hành chính: +1 ngày

// Lưu ý: Thời gian tính từ lúc đơn hàng được xác nhận thanh toán.`,
//       category: 'FAQ',
//       tags: ['giao-hang', 'shipping', 'thoi-gian'],
//     },
//     {
//       slug: 'faq-return-policy',
//       title: 'Chính sách hoàn trả như thế nào?',
//       content: `Chúng tôi cấp 30 ngày hoàn tiền hoàn toàn nếu bạn không hài lòng.

// Điều kiện hoàn trả:
// - Hàng hóa phải ở tình trạng nguyên bản
// - Chưa sử dụng hoặc giặt
// - Còn tag và packaging gốc
// - Hoàn tiền trong 5-7 ngày làm việc

// Hoàn trả miễn phí:
// - Chúng tôi cung cấp nhãn vận chuyển miễn phí
// - Không hỏi lý do hoàn trả`,
//       category: 'FAQ',
//       tags: ['hoan-tra', 'return', 'chinh-sach'],
//     },
//     {
//       slug: 'faq-sizing-guide',
//       title: 'Cách chọn size phù hợp?',
//       content: `Để chọn size phù hợp, bạn cần biết:
// - Chiều cao (cm)
// - Cân nặng (kg)
// - Các số đo cơ thể (ngực, vai, dài áo)

// Hướng dẫn chọn size:
// 1. Xem bảng size chi tiết theo từng thương hiệu
// 2. Đối chiếu với số đo cơ thể của bạn
// 3. Nếu nằm giữa 2 size, chọn size lớn hơn để thoải mái
// 4. Sử dụng tính năng "Size Recommendation" để được gợi ý

// Lưu ý: Mỗi thương hiệu có tiêu chí size khác nhau.`,
//       category: 'FAQ',
//       tags: ['size', 'fit', 'bang-size', 'huong-dan'],
//     },
//     {
//       slug: 'faq-payment-methods',
//       title: 'Hỗ trợ những phương thức thanh toán nào?',
//       content: `Chúng tôi hỗ trợ nhiều phương thức thanh toán an toàn:

// 1. Thẻ tín dụng/ghi nợ: Visa, Mastercard, JCB
// 2. Ví điện tử: Momo, ZaloPay, AirPay
// 3. Chuyển khoản ngân hàng: Chuyển trong 1 giờ
// 4. Thanh toán khi nhận hàng (COD): Áp dụng toàn quốc, phí 15,000 VND

// Tất cả giao dịch được mã hóa SSL bảo mật.`,
//       category: 'FAQ',
//       tags: ['thanh-toan', 'payment', 'the', 'vi-dien-tu'],
//     },
//     {
//       slug: 'faq-exchange-policy',
//       title: 'Có thể đổi size không?',
//       content: `Có, bạn hoàn toàn có thể đổi size!

// Điều kiện đổi:
// - Trong vòng 15 ngày kể từ ngày nhận hàng
// - Hàng phải ở tình trạng nguyên bản
// - Chưa sử dụng hoặc giặt

// Chi phí đổi:
// - Đổi cùng size/màu/sản phẩm: Miễn phí
// - Đổi size khác: Miễn phí (chúng tôi chịu phí vận chuyển)

// Quy trình:
// 1. Liên hệ CS để thông báo muốn đổi
// 2. Nhận nhãn vận chuyển miễn phí
// 3. Gửi hàng về
// 4. Nhận hàng mới trong 3-5 ngày`,
//       category: 'FAQ',
//       tags: ['doi', 'exchange', 'size-khac'],
//     },
//     // POLICIES
//     {
//       slug: 'policy-customer-protection',
//       title: 'Chính sách bảo vệ khách hàng',
//       content: `CHÍNH SÁCH BẢO VỆ KHÁCH HÀNG - 100% AN TOÀN

// 1. Quyền bảo vệ
//    - Mọi khách hàng được bảo vệ tối đa 100% nếu sản phẩm không phù hợp mô tả
//    - Chúng tôi cam kết hàng chính hãng 100%

// 2. Hoàn tiền
//    - Hoàn tiền trong 5-7 ngày làm việc
//    - Không câu hỏi, không phức tạp
//    - Hoàn lại toàn bộ số tiền thanh toán

// 3. Không hỏi lý do
//    - Bạn không cần giải thích vì sao muốn trả
//    - Chúng tôi tin tưởng khách hàng

// 4. Miễn phí vận chuyển
//    - Hoàn trả miễn phí cho khách hàng
//    - Chúng tôi cung cấp nhãn vận chuyển

// 5. Hỗ trợ 24/7
//    - Email: support@shop.vn
//    - Live chat trên website`,
//       category: 'POLICY',
//       tags: ['bao-ve', 'customer-protection', 'chinh-sach'],
//     },
//     {
//       slug: 'policy-data-security',
//       title: 'Chính sách bảo mật dữ liệu',
//       content: `CHÍNH SÁCH BẢO MẬT DỮ LIỆU CÁ NHÂN

// 1. Bảo vệ thông tin cá nhân
//    - Không chia sẻ thông tin với bên thứ ba
//    - Chỉ dùng cho xử lý đơn hàng
//    - Không gửi quảng cáo nếu không đồng ý

// 2. Mã hóa dữ liệu
//    - Mã hóa SSL cho tất cả giao dịch
//    - Database được bảo vệ nhiều lớp
//    - Backup hàng ngày

// 3. Quyền của khách hàng
//    - Quyền truy cập: Xem dữ liệu của bạn
//    - Quyền sửa: Cập nhật thông tin cá nhân
//    - Quyền xóa: Yêu cầu xóa dữ liệu

// 4. Tuân thủ pháp luật
//    - GDPR Compliant (EU)
//    - Tuân thủ luật Việt Nam`,
//       category: 'POLICY',
//       tags: ['bao-mat', 'data-security', 'privacy'],
//     },
//   ];

//   for (const content of siteContents) {
//     await prisma.site_contents.upsert({
//       where: { slug: content.slug },
//       update: {
//         title: content.title,
//         content: content.content,
//         category: content.category,
//         tags: content.tags,
//       },
//       create: {
//         slug: content.slug,
//         title: content.title,
//         content: content.content,
//         category: content.category,
//         tags: content.tags,
//         status: true,
//       },
//     });
//   }

//   console.log(`✅ Seeded ${siteContents.length} site contents`);

//   console.log('✅ Seed completed successfully!');
// }

// main()
//   .catch((e) => {
//     console.error('❌ Seed failed:', e);
//     process.exit(1);
//   })
//   .finally(() => {
//     void prisma.$disconnect();
//   });
