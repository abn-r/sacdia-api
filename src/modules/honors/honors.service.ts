import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Logger
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Prisma } from '@prisma/client'

@Injectable()
export class HonorsService {

  private readonly logger = new Logger(HonorsService.name);

  constructor(private prisma: PrismaService) {}

  async create(createHonorDto: Prisma.honorsCreateInput) {
    if (!createHonorDto.name) {
      throw new BadRequestException('Name are required');
    }

    const existingHonor = await this.prisma.honors.findFirst({
      where: {
        name: createHonorDto.name,
      }
    });

    if (existingHonor) {
      throw new ConflictException('Honor with this name already exists');
    }

    try {
      const newHonor = await this.prisma.honors.create({
        data: createHonorDto,
      });

      const clubDto = {
        honor_id: newHonor.honor_id,
        name: newHonor.name,
      }

      return clubDto
    } catch (error) {
      throw new BadRequestException('Invalid data provided');
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.honorsWhereUniqueInput;
    where?: Prisma.honorsWhereInput;
    orderBy?: Prisma.honorsOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.honors.findMany({
      skip,
      take,
      cursor,
      where: { ...where, active: true },
      orderBy: orderBy || { honor_id: 'asc' },
      include: {
        honors_categories: { select: { name: true } },
        master_honors: { select: { name: true } },
      },
    });
  }

  async findOne(id: number) {
    const honors = await this.prisma.honors.findUnique({
      where: { honor_id: id },
      include: {
        honors_categories: { select: { name: true } },
        master_honors: { select: { name: true } },
      },
    });

    if (!honors) {
      throw new NotFoundException(`Honors with ID ${id} not found`);
    }

    return honors;
  }

  async update(id: number, updateHonorsDto: Prisma.honorsUpdateInput) {
    await this.findOne(id);

    if (updateHonorsDto.name) {
      const existingHonors = await this.prisma.honors.findFirst({
        where: {
          name: updateHonorsDto.name as string
        }
      });

      if (existingHonors) {
        throw new ConflictException('Honors with this name already exists');
      }
    }

    return this.prisma.honors.update({
      where: { honor_id: id },
      data: {
        ...updateHonorsDto,
        modified_at: new Date(),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      await this.prisma.honors.delete({ where: { honor_id: id } });
      return {
        status: true,
        message: 'Honor deleted successfully'
      };
    } catch (error) {
      throw new BadRequestException('Unable to delete Honor');
    }
  }

  async softDelete(id: number) {
    await this.findOne(id);

    try {
      await this.prisma.honors.update({
        where: { honor_id: id },
        data: { active: false },
      });
      return {
        status: true,
        message: 'Honor deleted successfully'
      };
    } catch (error) {
      throw new BadRequestException('Unable to soft delete Honor');
    }
  }
}