import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UsersService {

  constructor(private prisma: PrismaService) {}

  async findAll(
    params: {
      skip?: number;
      take?: number;
      cursor?: Prisma.usersWhereUniqueInput;
      where?: Prisma.usersWhereInput;
      orderBy?: Prisma.usersOrderByWithRelationInput;
    }
  ) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.users.findMany({
      skip,
      take,
      cursor,
      where: { ...where, active: true },
      orderBy: orderBy || { name: 'asc' },
    });
  }

  findOne(usersWhereUniqueInput: Prisma.usersWhereUniqueInput) {
    const user = this.prisma.users.findUnique({
      where: usersWhereUniqueInput
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${usersWhereUniqueInput.user_id} not found`);
    }
    return user;
  }

  async update(
    where: Prisma.usersWhereUniqueInput,
    updateUserDto: Prisma.usersUpdateInput,
  ) {
    await this.findOne({ user_id: where.user_id });

    if (updateUserDto.name) {
      await this.checkDuplicate('name', updateUserDto.name as string, where.user_id);
    }
    if (updateUserDto.email) {
      await this.checkDuplicate('email', updateUserDto.email as string, where.user_id);
    }

    try {
      const updatedUser = await this.prisma.users.update({
        where,
        data: {
          ...updateUserDto,
          modified_at: new Date(),
        },
      });

      return {
        status: true,
        message: `User "${updatedUser.name}" updated successfully`,
      };
    } catch (error) {
      throw new BadRequestException('Unable to update user');
    }
  }

  async remove(where: Prisma.usersWhereUniqueInput) {
    await this.findOne(where);

    try {
      await this.prisma.users.update({
        where,
        data: { active: false },
      });
      return {
        status: true,
        message: 'User deleted successfully'
      };
    } catch (error) {
      throw new BadRequestException('Unable to soft delete Districts');
    }
  }

  private async checkDuplicate(field: 'name' | 'email', value: string, currentUserId: string) {
    const existingUser = await this.prisma.users.findFirst({
      where: {
        [field]: value,
        NOT: { user_id: currentUserId }
      }
    });

    if (existingUser) {
      throw new ConflictException(`User with this ${field} already exists`);
    }
  }
}