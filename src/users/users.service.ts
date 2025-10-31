// src/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, users, customers } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, CreateCustomerDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from './dtos/update-profile';

// helper: bỏ password an toàn, không tạo biến 'password' thừa
function withoutPassword<T extends { password?: unknown }>(u: T): Omit<T, 'password'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _pw, ...safe } = u;
  return safe;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================
  // Refresh token helpers
  // =========================
  async findByRefreshToken(refreshToken: string): Promise<users | null> {
    return this.prisma.users.findFirst({ where: { refresh_token: refreshToken } });
  }

  async updateRefreshToken(userId: number, token: string): Promise<void> {
    const exp = new Date();
    exp.setDate(exp.getDate() + 7);
    await this.prisma.users.update({
      where: { user_id: userId },
      // ⚠️ schema bạn là expired_at (không phải refresh_token_exp)
      data: { refresh_token: token, expired_at: exp },
    });
  }

  // =========================
  // Create user (ADMIN)
  // =========================
  async create(createUserDto: CreateUserDto): Promise<Omit<users, 'password'>> {
    const { role_ids, ...userData } = createUserDto;

    const exists = await this.prisma.users.findFirst({
      where: { OR: [{ username: userData.username }, { email: userData.email }] },
      select: { user_id: true },
    });
    if (exists) throw new ConflictException('Username hoặc email đã tồn tại');

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const created = await this.prisma.$transaction(async (tx) => {
      const u = await tx.users.create({
        data: {
          ...userData,
          password: hashedPassword,
          // status là boolean theo Prisma (mặc định true trong schema)
        } as Prisma.usersCreateInput,
      });

      if (role_ids?.length) {
        await tx.user_role.createMany({
          data: role_ids.map((rid) => ({ user_id: u.user_id, role_id: rid })),
          skipDuplicates: true,
        });
      }
      return u;
    });

    const full = await this.prisma.users.findUnique({
      where: { user_id: created.user_id },
      include: { user_role: { include: { roles: true } }, customers: true },
    });
    return withoutPassword(full!);
  }

  // =========================
  // Đăng ký customer
  // =========================
  async createCustomer(dto: CreateCustomerDto): Promise<customers> {
    const { birthday, gender, ...userData } = dto;

    const exists = await this.prisma.users.findFirst({
      where: { OR: [{ username: userData.username }, { email: userData.email }] },
      select: { user_id: true },
    });
    if (exists) throw new ConflictException('Username hoặc email đã tồn tại');

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const customer = await this.prisma.$transaction(async (tx) => {
      const user = await tx.users.create({
        data: { ...userData, password: hashedPassword } as Prisma.usersCreateInput,
      });

      const customerRole = await tx.roles.findFirst({ where: { role_name: 'CUSTOMER' } });
      if (customerRole) {
        await tx.user_role.create({
          data: { user_id: user.user_id, role_id: customerRole.role_id },
        });
      }

      const cust = await tx.customers.create({
        data: { user_id: user.user_id, birthday, gender: gender as any },
      });

      await tx.cart.create({
        data: { customer_id: cust.customer_id, total_price: new Prisma.Decimal(0) },
      });

      return cust;
    });

    return customer;
  }

  // =========================
  // Read
  // =========================
  async findAll() {
    const rows = await this.prisma.users.findMany({
      include: { user_role: { include: { roles: true } }, customers: true },
      orderBy: { created_at: 'desc' },
    });
    return rows.map(withoutPassword);
  }

  async findOne(id: number): Promise<Omit<users, 'password'>> {
    const user = await this.prisma.users.findUnique({
      where: { user_id: id },
      include: { user_role: { include: { roles: true } }, customers: true },
    });
    if (!user) throw new NotFoundException(`User với ID ${id} không tìm thấy`);
    return withoutPassword(user);
  }

  async findByUsername(username: string): Promise<users | null> {
    return this.prisma.users.findFirst({
      where: { username },
      include: { user_role: { include: { roles: true } } },
    });
  }

  async findByEmail(email: string): Promise<users | null> {
    return this.prisma.users.findFirst({
      where: { email },
      include: { user_role: { include: { roles: true } } },
    });
  }

  // =========================
  // Update
  // =========================
  async update(id: number, dto: UpdateUserDto): Promise<Omit<users, 'password'>> {
    const { role_ids, password, ...userData } = dto;
    await this.ensureUserExists(id);

    if (userData.username || userData.email) {
      const clash = await this.prisma.users.findFirst({
        where: {
          AND: [
            { user_id: { not: id } },
            {
              OR: [
                userData.username ? { username: userData.username } : undefined,
                userData.email ? { email: userData.email } : undefined,
              ].filter(Boolean) as any,
            },
          ],
        },
        select: { user_id: true },
      });
      if (clash) throw new ConflictException('Username hoặc email đã tồn tại');
    }

    const data: Prisma.usersUpdateInput = { ...userData };
    if (password) (data as any).password = await bcrypt.hash(password, 10);

    await this.prisma.$transaction(async (tx) => {
      await tx.users.update({ where: { user_id: id }, data });
      if (role_ids?.length) {
        await tx.user_role.deleteMany({ where: { user_id: id } });
        await tx.user_role.createMany({
          data: role_ids.map((rid) => ({ user_id: id, role_id: rid })),
          skipDuplicates: true,
        });
      }
    });

    return this.findOne(id);
  }

  // =========================
  // Soft delete / Restore
  // =========================
  async remove(id: number): Promise<void> {
    await this.ensureUserExists(id);
    // ⚠️ status là boolean
    await this.prisma.users.update({ where: { user_id: id }, data: { status: false } });
  }

  async restore(id: number): Promise<Omit<users, 'password'>> {
    await this.ensureUserExists(id);
    await this.prisma.users.update({ where: { user_id: id }, data: { status: true } });
    return this.findOne(id);
  }

  // =========================
  // Queries tiện ích
  // =========================
  async findByRole(roleName: string) {
    const rows = await this.prisma.users.findMany({
      where: { status: true, user_role: { some: { roles: { role_name: roleName } } } },
      include: { user_role: { include: { roles: true } }, customers: true },
    });
    return rows.map(withoutPassword);
  }

  async countByStatus(status: number | boolean): Promise<number> {
    // chấp nhận 0/1 từ FE, convert sang boolean cho Prisma
    const b = typeof status === 'boolean' ? status : status === 1;
    return this.prisma.users.count({ where: { status: b } });
  }

  async findWithPagination(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.users.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: { user_role: { include: { roles: true } }, customers: true },
      }),
      this.prisma.users.count(),
    ]);
    return {
      data: data.map(withoutPassword),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async search(keyword: string) {
    const rows = await this.prisma.users.findMany({
      where: {
        status: true,
        OR: [
          { username: { contains: keyword, mode: 'insensitive' } },
          { email: { contains: keyword, mode: 'insensitive' } },
          { full_name: { contains: keyword, mode: 'insensitive' } },
        ],
      },
      include: { user_role: { include: { roles: true } }, customers: true },
      orderBy: { created_at: 'desc' },
    });
    return rows.map(withoutPassword);
  }

  // Dùng cho CartController
  async findCustomerIdByUserId(userId: number): Promise<number> {
    const customer = await this.prisma.customers.findUnique({
      where: { user_id: userId },
      select: { customer_id: true },
    });
    if (!customer) throw new UnauthorizedException('Token này không thuộc về customer nào');
    return customer.customer_id;
  }

  // =========================
  // Helpers
  // =========================
  private async ensureUserExists(id: number) {
    const u = await this.prisma.users.findUnique({
      where: { user_id: id },
      select: { user_id: true },
    });
    if (!u) throw new NotFoundException(`User với ID ${id} không tìm thấy`);
  }

  async updateProfile(userId: number, updateData: UpdateProfileDto) {
    // Kiểm tra user có tồn tại không
    const user = await this.prisma.users.findUnique({
      where: { user_id: userId },
      include: { customers: true },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    if (!user.status) {
      throw new BadRequestException('Tài khoản đã bị vô hiệu hóa');
    }

    // Kiểm tra email trùng lặp (nếu có thay đổi)
    if (updateData.email && updateData.email !== user.email) {
      const existingEmail = await this.prisma.users.findUnique({
        where: { email: updateData.email },
      });

      if (existingEmail) {
        throw new ConflictException('Email đã được sử dụng');
      }
    }

    // Kiểm tra số điện thoại trùng lặp (nếu có thay đổi)
    if (updateData.phone && updateData.phone !== user.phone) {
      const existingPhone = await this.prisma.users.findFirst({
        where: {
          phone: updateData.phone,
          user_id: { not: userId },
        },
      });

      if (existingPhone) {
        throw new ConflictException('Số điện thoại đã được sử dụng');
      }
    }

    // Tách dữ liệu cho bảng users và customers
    const { full_name, email, phone, birthday, gender } = updateData;

    // Cập nhật trong transaction để đảm bảo tính toàn vẹn dữ liệu
    const result = await this.prisma.$transaction(async (tx) => {
      // Cập nhật bảng users
      const updatedUser = await tx.users.update({
        where: { user_id: userId },
        data: {
          full_name,
          email,
          phone,
          updated_at: new Date(),
        },
      });

      // Cập nhật hoặc tạo mới customer
      const updatedCustomer = await tx.customers.upsert({
        where: { user_id: userId },
        update: {
          birthday: birthday ? new Date(birthday) : undefined,
          gender,
          updated_at: new Date(),
        },
        create: {
          user_id: userId,
          birthday: birthday ? new Date(birthday) : null,
          gender: gender || null,
        },
      });

      return { user: updatedUser, customer: updatedCustomer };
    });

    // Trả về thông tin đã cập nhật (loại bỏ các trường nhạy cảm)
    return {
      user_id: result.user.user_id,
      username: result.user.username,
      email: result.user.email,
      phone: result.user.phone,
      full_name: result.user.full_name,
      birthday: result.customer.birthday,
      gender: result.customer.gender,
      updated_at: result.user.updated_at,
    };
  }

  async getProfile(userId: number) {
    const user = await this.prisma.users.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        username: true,
        email: true,
        phone: true,
        full_name: true,
        status: true,
        created_at: true,
        updated_at: true,
        customers: {
          select: {
            customer_id: true,
            birthday: true,
            gender: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    return {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      full_name: user.full_name,
      birthday: user.customers?.birthday,
      gender: user.customers?.gender,
      status: user.status,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
}
