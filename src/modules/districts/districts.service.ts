import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Logger
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class DistrictsService {
  private readonly logger = new Logger(DistrictsService.name);

  constructor(private prisma: PrismaService) {}

    async create(createDistrictDto: Prisma.districtsCreateInput) {
    if (!createDistrictDto.name  ) { 
      throw new BadRequestException('Name are required');
    } 

    const existingLocalField = await this.prisma.districts.findFirst({
      where: {
        name: createDistrictDto.name,
      }
    });

    if (existingLocalField) {
      throw new ConflictException('District with this name already exists');
    }

    try {
      const newDistrict = await this.prisma.districts.create({
        data: createDistrictDto,
      });

      const districtDto = {
        district_id: newDistrict.district_id,
        name: newDistrict.name,
      }

      return districtDto
    } catch (error) {
      throw new BadRequestException('Invalid data provided');
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.districtsWhereUniqueInput;
    where?: Prisma.districtsWhereInput;
    orderBy?: Prisma.districtsOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.districts.findMany({
      skip,
      take,
      cursor,
      where: { ...where, active: true },
      orderBy: orderBy || { district_id: 'asc' },
      include: { local_fields: { select: { name: true } } },
    });
  }

  async findOne(id: number) {
    const districts = await this.prisma.districts.findUnique({
      where: { district_id: id },
      include: { local_fields: { select: { name: true } } },
    });

    if (!districts) {
      throw new NotFoundException(`Districts with ID ${id} not found`);
    }

    return districts;
  }

  async update(id: number, updateDistrictsDto: Prisma.districtsUpdateInput) {
    await this.findOne(id);

    if (updateDistrictsDto.name || updateDistrictsDto.local_fields) {
      const existingDistricts = await this.prisma.districts.findFirst({
        where: {
          OR: [
            { name: updateDistrictsDto.name as string },
            { local_fields: { name: updateDistrictsDto.local_fields as string } }
          ],
          NOT: { local_field_id: id }
        }
      });

      if (existingDistricts) {
        throw new ConflictException('Districts with this name or abbreviation already exists');
      }
    }

    return this.prisma.districts.update({
      where: { district_id: id },
      data: {
        ...updateDistrictsDto,
        modified_at: new Date(),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      await this.prisma.districts.delete({ where: { district_id: id } });
      return {
        status: true,
        message: 'Districts deleted successfully'
      };
    } catch (error) {
      throw new BadRequestException('Unable to delete Districts');
    }
  }

  async softDelete(id: number) {
    await this.findOne(id);

    try {
      await this.prisma.districts.update({
        where: { district_id: id },
        data: { active: false },
      });
      return {
        status: true,
        message: 'Districts deleted successfully'
      };
    } catch (error) {
      throw new BadRequestException('Unable to soft delete Districts');
    }
  }
}