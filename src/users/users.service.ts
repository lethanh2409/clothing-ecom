import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Customer } from './entities/customer.entity';
import { UserRole } from './entities/user-role.entity';
import { Role } from './entities/role.entity';
import { CreateUserDto, CreateCustomerDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Customer) private readonly customerRepository: Repository<Customer>,
    @InjectRepository(UserRole) private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    @InjectRepository(Customer) private readonly cartRepository: Repository<Customer>, // 👈 thêm
  ) {}

  // 👇 thêm hàm này
  async findByRefreshToken(refreshToken: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { refresh_token: refreshToken } });
  }

  async updateRefreshToken(userId: number, token: string): Promise<void> {
    const exp = new Date();
    exp.setDate(exp.getDate() + 7); // refresh token sống 7 ngày

    await this.userRepository.update(userId, {
      refresh_token: token,
      refresh_token_exp: exp,
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { role_ids, ...userData } = createUserDto;

    // Kiểm tra username và email đã tồn tại
    const existingUser = await this.userRepository.findOne({
      where: [{ username: userData.username }, { email: userData.email }],
    });

    if (existingUser) {
      throw new ConflictException('Username hoặc email đã tồn tại');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // Tạo user
    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    // Gán roles nếu có
    if (role_ids && role_ids.length > 0) {
      await this.assignRolesToUser(savedUser.user_id, role_ids);
    }

    return this.findOne(savedUser.user_id);
  }

  async createCustomer(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const { birthday, gender, ...userData } = createCustomerDto;

    // Kiểm tra username và email đã tồn tại
    const existingUser = await this.userRepository.findOne({
      where: [{ username: userData.username }, { email: userData.email }],
    });

    if (existingUser) {
      throw new ConflictException('Username hoặc email đã tồn tại');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // Tạo user
    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    // Gán role customer mặc định
    const customerRole = await this.roleRepository.findOne({
      where: { role_name: 'customer' },
    });

    if (customerRole) {
      await this.assignRolesToUser(savedUser.user_id, [customerRole.role_id]);
    }

    // Tạo customer profile
    const customer = this.customerRepository.create({
      user_id: savedUser.user_id,
      birthday,
      gender,
      cart: {
        total_price: 0,
        session_id: null,
      },
    });

    return await this.customerRepository.save(customer);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      relations: ['userRoles', 'userRoles.role', 'customer'],
      select: {
        user_id: true,
        username: true,
        email: true,
        phone: true,
        full_name: true,
        status: true,
        created_at: true,
        updated_at: true,
        userRoles: {
          user_role_id: true,
          role: {
            role_name: true, // 👈 chỉ lấy role_name
          },
        },
      },
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { user_id: id },
      relations: ['userRoles', 'userRoles.role', 'customer'],
      select: {
        user_id: true,
        username: true,
        email: true,
        phone: true,
        full_name: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User với ID ${id} không tìm thấy`);
    }

    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { username },
      relations: ['userRoles', 'userRoles.role'],
      select: {
        user_id: true,
        username: true,
        email: true,
        password: true, // Cần password để validate login
        phone: true,
        full_name: true,
        status: true,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      relations: ['userRoles', 'userRoles.role'],
      select: {
        user_id: true,
        username: true,
        email: true,
        password: true, // Cần password để validate login
        phone: true,
        full_name: true,
        status: true,
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const { role_ids, password, ...userData } = updateUserDto;

    await this.findOne(id); // Check if user exists

    let existingUser: User | null = null;

    if (userData.username) {
      existingUser = await this.userRepository.findOne({
        where: { username: userData.username },
      });
    }

    if (!existingUser && userData.email) {
      existingUser = await this.userRepository.findOne({
        where: { email: userData.email },
      });
    }

    // Hash password mới nếu có
    if (password) {
      const saltRounds = 10;
      (userData as any).password = await bcrypt.hash(password, saltRounds);
    }

    // Update user data
    await this.userRepository.update(id, userData);

    // Update roles nếu có
    if (role_ids && role_ids.length > 0) {
      // Xóa roles cũ
      await this.userRoleRepository.delete({ user_id: id });
      // Thêm roles mới
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await this.assignRolesToUser(id, role_ids);
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // Check if user exists

    // Soft delete - chỉ update status
    await this.userRepository.update(id, { status: 0 });
  }

  async restore(id: number): Promise<User> {
    await this.userRepository.update(id, { status: 1 });
    return this.findOne(id);
  }

  // Helper method để gán roles cho user
  private async assignRolesToUser(userId: number, roleIds: number[]): Promise<void> {
    const userRoles = roleIds.map((roleId) =>
      this.userRoleRepository.create({
        user_id: userId,
        role_id: roleId,
      }),
    );

    await this.userRoleRepository.save(userRoles);
  }

  // Tìm users theo role
  async findByRole(roleName: string): Promise<User[]> {
    return await this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.userRoles', 'userRole')
      .innerJoin('userRole.role', 'role')
      .where('role.role_name = :roleName', { roleName })
      .andWhere('user.status = :status', { status: 1 })
      .getMany();
  }

  // Đếm số user theo status
  async countByStatus(status: number): Promise<number> {
    return await this.userRepository.count({ where: { status } });
  }

  // Tìm user với pagination
  async findWithPagination(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.userRepository.findAndCount({
      relations: ['userRoles', 'userRoles.role', 'customer'],
      select: {
        user_id: true,
        username: true,
        email: true,
        phone: true,
        full_name: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Search users
  async search(keyword: string): Promise<User[]> {
    return await this.userRepository
      .createQueryBuilder('user')
      .where('user.username LIKE :keyword', { keyword: `%${keyword}%` })
      .orWhere('user.email LIKE :keyword', { keyword: `%${keyword}%` })
      .orWhere('user.full_name LIKE :keyword', { keyword: `%${keyword}%` })
      .andWhere('user.status = :status', { status: 1 })
      .leftJoinAndSelect('user.userRoles', 'userRoles')
      .leftJoinAndSelect('userRoles.role', 'role')
      .leftJoinAndSelect('user.customer', 'customer')
      .getMany();
  }

  // src/users/users.service.ts
  async findCustomerIdByUserId(userId: number): Promise<number> {
    const customer = await this.customerRepository.findOne({
      where: { user: { user_id: userId } },
    });

    if (!customer) {
      throw new UnauthorizedException('Token này không thuộc về customer nào');
    }

    return customer.customer_id;
  }
}
