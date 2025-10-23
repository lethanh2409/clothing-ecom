import type { PrismaClient } from '@prisma/client';

const sizesData = [
  // Adidas (brand_id=1) – áo nam S/M/L/XL
  {
    // 1
    brand_id: 1,
    gender: 'male',
    size_label: 'S',
    height_range: '1m60–1m68',
    weight_range: '50–60kg',
    type: 'tshirt & polo',
    measurements: { chest: '87cm', waist: '75cm', hip: '86cm', length: '68cm' },
  },
  {
    // 2
    brand_id: 1,
    gender: 'male',
    size_label: 'M',
    height_range: '1m68–1m75',
    weight_range: '60–70kg',
    type: 'tshirt & polo',
    measurements: { chest: '93cm', waist: '81cm', hip: '92cm', length: '71cm' },
  },
  {
    // 3
    brand_id: 1,
    gender: 'male',
    size_label: 'L',
    height_range: '1m75–1m82',
    weight_range: '70–80kg',
    type: 'tshirt & polo',
    measurements: { chest: '101cm', waist: '89cm', hip: '100cm', length: '74cm' },
  },
  {
    // 4
    brand_id: 1,
    gender: 'male',
    size_label: 'XL',
    height_range: '1m82–1m90',
    weight_range: '80–90kg',
    type: 'tshirt & polo',
    measurements: { chest: '109cm', waist: '97cm', hip: '108cm', length: '76cm' },
  },

  // Adidas (brand_id=1) – quần (S/ M/ L/ XL)
  {
    // 5
    brand_id: 1,
    gender: 'male',
    type: 'pants',
    size_label: 'XS',
    height_range: '1m6-1m65',
    weight_range: '50-60kg',
    measurements: { waist: '71cm', hip: '82cm', length: '96cm' },
  },
  {
    // 6
    brand_id: 1,
    gender: 'male',
    type: 'pants',
    size_label: 'S',
    height_range: '1m65-1m70',
    weight_range: '60-70kg',
    measurements: { waist: '75cm', hip: '86cm', length: '98cm' },
  },
  {
    // 7
    brand_id: 1,
    gender: 'male',
    type: 'pants',
    size_label: 'M',
    height_range: '1m70-1m75',
    weight_range: '70-80kg',
    measurements: { waist: '79cm', hip: '90cm', length: '100cm' },
  },
  {
    // 8
    brand_id: 1,
    gender: 'male',
    type: 'pants',
    size_label: 'L',
    height_range: '1m75-1m80',
    weight_range: '80-90kg',
    measurements: { waist: '83cm', hip: '94cm', length: '102cm' },
  },
  {
    // 9
    brand_id: 1,
    gender: 'male',
    type: 'pants',
    size_label: 'XL',
    height_range: '1m80-1m85',
    weight_range: '90-100kg',
    measurements: { waist: '87cm', hip: '98cm', length: '104cm' },
  },

  // Nike (brand_id=2) – áo nam S/M/L/XL
  {
    // 10
    brand_id: 2,
    gender: 'male',
    size_label: 'S',
    height_range: '1m60–1m68',
    weight_range: '50–60kg',
    type: 'tshirt & polo',
    measurements: { chest: '88cm', waist: '76cm', hip: '87cm', length: '69cm' },
  },
  {
    // 11
    brand_id: 2,
    gender: 'male',
    size_label: 'M',
    height_range: '1m68–1m75',
    weight_range: '60–70kg',
    type: 'tshirt & polo',
    measurements: { chest: '94cm', waist: '82cm', hip: '93cm', length: '72cm' },
  },
  {
    // 12
    brand_id: 2,
    gender: 'male',
    size_label: 'L',
    height_range: '1m75–1m82',
    weight_range: '70–80kg',
    type: 'tshirt & polo',
    measurements: { chest: '102cm', waist: '90cm', hip: '101cm', length: '75cm' },
  },
  {
    // 13
    brand_id: 2,
    gender: 'male',
    size_label: 'XL',
    height_range: '1m82–1m90',
    weight_range: '80–90kg',
    type: 'tshirt & polo',
    measurements: { chest: '110cm', waist: '98cm', hip: '109cm', length: '78cm' },
  },

  // Nike (brand_id=2) – quần (S/ M/ L/ XL)
  {
    // 14
    brand_id: 2,
    gender: 'male',
    type: 'pants',
    size_label: 'XS',
    height_range: '1m6-1m65',
    weight_range: '50-60kg',
    measurements: { waist: '72cm', hip: '83cm', length: '95cm' },
  },
  {
    // 15
    brand_id: 2,
    gender: 'male',
    type: 'pants',
    size_label: 'S',
    height_range: '1m65-1m70',
    weight_range: '60-70kg',
    measurements: { waist: '76cm', hip: '87cm', length: '97cm' },
  },
  {
    // 16
    brand_id: 2,
    gender: 'male',
    type: 'pants',
    size_label: 'M',
    height_range: '1m70-1m75',
    weight_range: '70-80kg',
    measurements: { waist: '80cm', hip: '91cm', length: '99cm' },
  },
  {
    // 17
    brand_id: 2,
    gender: 'male',
    type: 'pants',
    size_label: 'L',
    height_range: '1m75-1m80',
    weight_range: '80-90kg',
    measurements: { waist: '84cm', hip: '95cm', length: '101cm' },
  },
  {
    // 18
    brand_id: 2,
    gender: 'male',
    type: 'pants',
    size_label: 'XL',
    height_range: '1m80-1m85',
    weight_range: '90-100kg',
    measurements: { waist: '88cm', hip: '99cm', length: '103cm' },
  },

  // Uniqlo (brand_id=3) – áo nam S/M/L/XL
  {
    // 19
    brand_id: 3,
    gender: 'male',
    size_label: 'S',
    height_range: '1m60–1m68',
    weight_range: '50–60kg',
    type: 'tshirt & polo',
    measurements: { chest: '89cm', waist: '77cm', hip: '88cm', length: '70cm' },
  },
  {
    // 20
    brand_id: 3,
    gender: 'male',
    size_label: 'M',
    height_range: '1m68–1m75',
    weight_range: '60–70kg',
    type: 'tshirt & polo',
    measurements: { chest: '95cm', waist: '83cm', hip: '94cm', length: '73cm' },
  },
  {
    // 21
    brand_id: 3,
    gender: 'male',
    size_label: 'L',
    height_range: '1m75–1m82',
    weight_range: '70–80kg',
    type: 'tshirt & polo',
    measurements: { chest: '103cm', waist: '91cm', hip: '102cm', length: '76cm' },
  },
  {
    // 22
    brand_id: 3,
    gender: 'male',
    size_label: 'XL',
    height_range: '1m82–1m90',
    weight_range: '80–90kg',
    type: 'tshirt & polo',
    measurements: { chest: '111cm', waist: '99cm', hip: '110cm', length: '79cm' },
  },

  // Uniqlo (brand_id=3) – quần (S/ M/ L/ XL)
  {
    // 23
    brand_id: 3,
    gender: 'male',
    type: 'pants',
    size_label: 'XS',
    height_range: '1m6-1m65',
    weight_range: '50-60kg',
    measurements: { waist: '73cm', hip: '84cm', length: '94cm' },
  },
  {
    // 24
    brand_id: 3,
    gender: 'male',
    type: 'pants',
    size_label: 'S',
    height_range: '1m65-1m70',
    weight_range: '60-70kg',
    measurements: { waist: '77cm', hip: '88cm', length: '96cm' },
  },
  {
    // 25
    brand_id: 3,
    gender: 'male',
    type: 'pants',
    size_label: 'M',
    height_range: '1m70-1m75',
    weight_range: '70-80kg',
    measurements: { waist: '81cm', hip: '92cm', length: '98cm' },
  },
  {
    // 26
    brand_id: 3,
    gender: 'male',
    type: 'pants',
    size_label: 'L',
    height_range: '1m75-1m80',
    weight_range: '80-90kg',
    measurements: { waist: '85cm', hip: '96cm', length: '100cm' },
  },
  {
    // 27
    brand_id: 3,
    gender: 'male',
    type: 'pants',
    size_label: 'XL',
    height_range: '1m80-1m85',
    weight_range: '90-100kg',
    measurements: { waist: '89cm', hip: '100cm', length: '102cm' },
  },

  // Adidas (brand_id = 1) – ÁO nữ S/M/L/XL
  // -----------------------------
  {
    // 28
    brand_id: 1,
    gender: 'female',
    size_label: 'S',
    height_range: '1m52–1m60',
    weight_range: '43–53kg',
    type: 'tshirt & polo',
    measurements: { chest: '83cm', waist: '71cm', hip: '82cm', length: '66cm' },
  },
  {
    // 29
    brand_id: 1,
    gender: 'female',
    size_label: 'M',
    height_range: '1m58–1m65',
    weight_range: '50–60kg',
    type: 'tshirt & polo',
    measurements: { chest: '89cm', waist: '77cm', hip: '88cm', length: '69cm' },
  },
  {
    // 30
    brand_id: 1,
    gender: 'female',
    size_label: 'L',
    height_range: '1m65–1m72',
    weight_range: '58–68kg',
    type: 'tshirt & polo',
    measurements: { chest: '97cm', waist: '85cm', hip: '96cm', length: '72cm' },
  },
  {
    brand_id: 1,
    gender: 'female',
    size_label: 'XL',
    height_range: '1m70–1m78',
    weight_range: '66–76kg',
    type: 'tshirt & polo',
    measurements: { chest: '105cm', waist: '93cm', hip: '104cm', length: '74cm' },
  },

  // Adidas – QUẦN nữ XS/S/M/L/XL
  {
    // 31
    brand_id: 1,
    gender: 'female',
    type: 'pants',
    size_label: 'XS',
    height_range: '1m48–1m55',
    weight_range: '40–48kg',
    measurements: { waist: '65cm', hip: '80cm', length: '94cm' },
  },
  {
    // 32
    brand_id: 1,
    gender: 'female',
    type: 'pants',
    size_label: 'S',
    height_range: '1m55–1m60',
    weight_range: '45–55kg',
    measurements: { waist: '69cm', hip: '84cm', length: '96cm' },
  },
  {
    // 33
    brand_id: 1,
    gender: 'female',
    type: 'pants',
    size_label: 'M',
    height_range: '1m60–1m65',
    weight_range: '50–60kg',
    measurements: { waist: '73cm', hip: '88cm', length: '98cm' },
  },
  {
    // 34
    brand_id: 1,
    gender: 'female',
    type: 'pants',
    size_label: 'L',
    height_range: '1m65–1m70',
    weight_range: '55–65kg',
    measurements: { waist: '77cm', hip: '92cm', length: '100cm' },
  },
  {
    // 35
    brand_id: 1,
    gender: 'female',
    type: 'pants',
    size_label: 'XL',
    height_range: '1m70–1m75',
    weight_range: '60–70kg',
    measurements: { waist: '81cm', hip: '96cm', length: '102cm' },
  },

  // -----------------------------
  // Nike (brand_id = 2) – ÁO nữ S/M/L/XL
  // -----------------------------
  {
    // 36
    brand_id: 2,
    gender: 'female',
    size_label: 'S',
    height_range: '1m52–1m60',
    weight_range: '43–53kg',
    type: 'tshirt & polo',
    measurements: { chest: '84cm', waist: '74cm', hip: '85cm', length: '67cm' },
  },
  {
    // 37
    brand_id: 2,
    gender: 'female',
    size_label: 'M',
    height_range: '1m58–1m65',
    weight_range: '50–60kg',
    type: 'tshirt & polo',
    measurements: { chest: '90cm', waist: '80cm', hip: '91cm', length: '70cm' },
  },
  {
    // 38
    brand_id: 2,
    gender: 'female',
    size_label: 'L',
    height_range: '1m65–1m72',
    weight_range: '58–68kg',
    type: 'tshirt & polo',
    measurements: { chest: '98cm', waist: '88cm', hip: '99cm', length: '73cm' },
  },
  {
    // 39
    brand_id: 2,
    gender: 'female',
    size_label: 'XL',
    height_range: '1m70–1m78',
    weight_range: '66–76kg',
    type: 'tshirt & polo',
    measurements: { chest: '106cm', waist: '96cm', hip: '107cm', length: '76cm' },
  },

  // Nike – QUẦN nữ XS/S/M/L/XL
  {
    // 40
    brand_id: 2,
    gender: 'female',
    type: 'pants',
    size_label: 'XS',
    height_range: '1m48–1m55',
    weight_range: '40–48kg',
    measurements: { waist: '66cm', hip: '81cm', length: '93cm' },
  },
  {
    // 41
    brand_id: 2,
    gender: 'female',
    type: 'pants',
    size_label: 'S',
    height_range: '1m55–1m60',
    weight_range: '45–55kg',
    measurements: { waist: '70cm', hip: '85cm', length: '95cm' },
  },
  {
    // 42
    brand_id: 2,
    gender: 'female',
    type: 'pants',
    size_label: 'M',
    height_range: '1m60–1m65',
    weight_range: '50–60kg',
    measurements: { waist: '74cm', hip: '89cm', length: '97cm' },
  },
  {
    // 43
    brand_id: 2,
    gender: 'female',
    type: 'pants',
    size_label: 'L',
    height_range: '1m65–1m70',
    weight_range: '55–65kg',
    measurements: { waist: '78cm', hip: '93cm', length: '99cm' },
  },
  {
    // 44
    brand_id: 2,
    gender: 'female',
    type: 'pants',
    size_label: 'XL',
    height_range: '1m70–1m75',
    weight_range: '60–70kg',
    measurements: { waist: '82cm', hip: '97cm', length: '101cm' },
  },

  // -----------------------------
  // Uniqlo (brand_id = 3) – ÁO nữ S/M/L/XL
  // -----------------------------
  {
    // 45
    brand_id: 3,
    gender: 'female',
    size_label: 'S',
    height_range: '1m52–1m60',
    weight_range: '43–53kg',
    type: 'tshirt & polo',
    measurements: { chest: '85cm', waist: '75cm', hip: '86cm', length: '68cm' },
  },
  {
    // 46
    brand_id: 3,
    gender: 'female',
    size_label: 'M',
    height_range: '1m58–1m65',
    weight_range: '50–60kg',
    type: 'tshirt & polo',
    measurements: { chest: '91cm', waist: '81cm', hip: '92cm', length: '71cm' },
  },
  {
    // 47
    brand_id: 3,
    gender: 'female',
    size_label: 'L',
    height_range: '1m65–1m72',
    weight_range: '58–68kg',
    type: 'tshirt & polo',
    measurements: { chest: '99cm', waist: '89cm', hip: '100cm', length: '74cm' },
  },
  {
    // 48
    brand_id: 3,
    gender: 'female',
    size_label: 'XL',
    height_range: '1m70–1m78',
    weight_range: '66–76kg',
    type: 'tshirt & polo',
    measurements: { chest: '107cm', waist: '97cm', hip: '108cm', length: '77cm' },
  },

  // Uniqlo – QUẦN nữ XS/S/M/L/XL
  {
    // 49
    brand_id: 3,
    gender: 'female',
    type: 'pants',
    size_label: 'XS',
    height_range: '1m48–1m55',
    weight_range: '40–48kg',
    measurements: { waist: '67cm', hip: '82cm', length: '92cm' },
  },
  {
    // 50
    brand_id: 3,
    gender: 'female',
    type: 'pants',
    size_label: 'S',
    height_range: '1m55–1m60',
    weight_range: '45–55kg',
    measurements: { waist: '71cm', hip: '86cm', length: '94cm' },
  },
  {
    // 51
    brand_id: 3,
    gender: 'female',
    type: 'pants',
    size_label: 'M',
    height_range: '1m60–1m65',
    weight_range: '50–60kg',
    measurements: { waist: '75cm', hip: '90cm', length: '96cm' },
  },
  {
    // 52
    brand_id: 3,
    gender: 'female',
    type: 'pants',
    size_label: 'L',
    height_range: '1m65–1m70',
    weight_range: '55–65kg',
    measurements: { waist: '79cm', hip: '94cm', length: '98cm' },
  },
  {
    // 53
    brand_id: 3,
    gender: 'female',
    type: 'pants',
    size_label: 'XL',
    height_range: '1m70–1m75',
    weight_range: '60–70kg',
    measurements: { waist: '83cm', hip: '98cm', length: '100cm' },
  },
];

// ---- SEED ----
export async function seedSizes(prisma: PrismaClient) {
  console.log('📏 Seeding sizes…');
  await prisma.sizes.createMany({ data: sizesData, skipDuplicates: true });
}
