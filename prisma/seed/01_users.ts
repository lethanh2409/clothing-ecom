import type { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// ---- DATASETS (bạn thêm phần tử tuỳ ý, field nào chưa có thì để null) ----
const rolesData = [
  { role_name: 'ADMIN', description: 'Quản trị hệ thống' },
  { role_name: 'STAFF', description: 'Nhân viên vận hành' },
  { role_name: 'CUSTOMER', description: 'Khách hàng' },
];
const hashedPassword = bcrypt.hashSync('password123', 10);
const usersData = [
  // Nếu schema yêu cầu password NOT NULL, điền sẵn hash/chuỗi tạm; nếu cho phép NULL thì để null
  {
    username: 'admin',
    password: hashedPassword,
    email: 'admin@demo.vn',
    phone: '0900000001',
    full_name: 'Quản Trị',
  },
  {
    username: 'staff1',
    password: hashedPassword,
    email: 'staff1@demo.vn',
    phone: '0900000002',
    full_name: 'Nhân Viên 1',
  },
  {
    username: 'khach1',
    password: hashedPassword,
    email: 'khach1@demo.vn',
    phone: '0900000003',
    full_name: 'Nguyễn Văn A',
  },
  {
    username: 'khach2',
    password: hashedPassword,
    email: 'khach2@demo.vn',
    phone: '0900000004',
    full_name: 'Nguyễn Văn B',
  },
];

const userRoleData = [
  { user_id: 1, role_id: 1 }, // admin → ADMIN
  { user_id: 2, role_id: 2 }, // staff1 → STAFF
  { user_id: 3, role_id: 3 }, // khach1 → CUSTOMER
  { user_id: 4, role_id: 3 }, // khach2 → CUSTOMER
];

const customersData = [
  { user_id: 3, birthday: new Date(1999, 8, 9), gender: 'male' },
  { user_id: 4, birthday: new Date(1998, 5, 15), gender: 'female' },
];

const addressesData = [
  {
    customer_id: 1,
    consignee_name: 'Nguyễn Văn A',
    consignee_phone: '0900000003',
    province: 'Thành phố Hà Nội',
    district: 'Quận Ba Đình',
    ward: 'Phường Phúc Xá',
    street: 'Phố Nguyễn Tri Phương',
    house_num: '10',
    is_default: true,
  },
  {
    customer_id: 1,
    consignee_name: 'Lê Thị C',
    consignee_phone: '0900000005',
    province: 'Thành phố Hà Nội',
    district: 'Quận Ba Đình',
    ward: 'Phường Phúc Xá',
    street: 'Phố Nguyễn Tri Phương',
    house_num: '10',
    is_default: false,
  },
  {
    customer_id: 2,
    consignee_name: 'Nguyễn Văn B',
    consignee_phone: '0900000004',
    province: 'Thành phố Hà Nội',
    district: 'Quận Hoàn Kiếm',
    ward: 'Phường Hàng Bài',
    street: 'Phố Tràng Tiền',
    house_num: '20',
    is_default: true,
  },
  {
    customer_id: 2,
    consignee_name: 'Trần Thị D',
    consignee_phone: '0900000006',
    province: 'Thành phố Hà Nội',
    district: 'Quận Hoàn Kiếm',
    ward: 'Phường Hàng Bài',
    street: 'Phố Hàng Bài',
    house_num: '15',
    is_default: false,
  },
];

// ---- SEED (không prisma.find; chỉ createMany) ----
export async function seedUsers(prisma: PrismaClient) {
  console.log('👤 Seeding roles/users/user_role/customers/addresses (data only)…');

  await prisma.roles.createMany({ data: rolesData, skipDuplicates: true });
  await prisma.users.createMany({ data: usersData, skipDuplicates: true });
  await prisma.user_role.createMany({ data: userRoleData, skipDuplicates: true });
  await prisma.customers.createMany({ data: customersData, skipDuplicates: true });
  await prisma.addresses.createMany({ data: addressesData, skipDuplicates: true });
}
