import { Body, Controller, Get, Param, Post, Patch, Delete, Put, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, CreateCustomerDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Roles } from '../auth/roles.decorate';
import { UpdateProfileDto } from './dtos/update-profile';
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  //Tạo customer user
  @Post('register')
  createCustomer(@Body() dto: CreateCustomerDto) {
    return this.userService.createCustomer(dto);
  }

  @Get('/all')
  @Roles('ADMIN')
  async findAll() {
    const users = await this.userService.findAll();
    return {
      success: true,
      message: 'Danh sách users',
      count: users.length,
      data: users,
    };
  }

  @Post()
  async create(@Body() dto: CreateUserDto) {
    const user = await this.userService.create(dto);
    return {
      success: true,
      message: 'Tạo user thành công',
      data: user,
    };
  }

  // Update user
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.userService.update(+id, dto);
  }

  // Soft delete
  @Delete(':id')
  remove(@Param('id') id: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.userService.remove(+id);
  }

  // Restore user
  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.userService.restore(+id);
  }

  // Tìm theo role
  @Get('role/:roleName')
  findByRole(@Param('roleName') roleName: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.userService.findByRole(roleName);
  }

  // Đếm theo status
  @Get('count/:status')
  countByStatus(@Param('status') status: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.userService.countByStatus(+status);
  }

  @Put('profile')
  async updateProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDto) {
    // ✅ Lấy user_id từ JWT payload
    const userId = Number(req.user.userId || req.user.user_id || req.user.id);

    if (!userId) {
      throw new Error('User ID not found in token');
    }

    return this.userService.updateProfile(userId, updateProfileDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const user = await this.userService.findOne(+id);
    return {
      success: true,
      message: `Thông tin user #${id}`,
      data: user,
    };
  }
}
