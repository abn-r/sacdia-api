import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class LocalFieldsService {

  constructor(private readonly prisma: PrismaService) {}

  async create(createLocalFieldDto: Prisma.local_fieldsCreateInput) {
    if (!createLocalFieldDto.name || !createLocalFieldDto.abbreviation ) { 
      throw new BadRequestException('Name, abbreviation are required');
    } 

    const existingLocalField = await this.prisma.local_fields.findFirst({
      where: {
        OR: [
          { name: createLocalFieldDto.name },
          { abbreviation: createLocalFieldDto.abbreviation }
        ]
      }
    });

    if (existingLocalField) {
      throw new ConflictException('Local Field with this name or abbreviation already exists');
    }

    try {
      const newLF = await this.prisma.local_fields.create({
        data: createLocalFieldDto,
      });

      const localfieldDto = {
        local_field_id: newLF.local_field_id,
        name: newLF.name,
        abbreviation: newLF.abbreviation
      }

      return localfieldDto
    } catch (error) {
      throw new BadRequestException('Invalid data provided');
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.local_fieldsWhereUniqueInput;
    where?: Prisma.local_fieldsWhereInput;
    orderBy?: Prisma.local_fieldsOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.local_fields.findMany({
      skip,
      take,
      cursor,
      where: { ...where, active: true },
      orderBy: orderBy || { local_field_id: 'asc' },
      include: { unions: { select: { name: true } } },
    });
  }

  async findOne(id: number) {
    const localField = await this.prisma.local_fields.findUnique({
      where: { local_field_id: id },
    });

    if (!localField) {
      throw new NotFoundException(`Local Field with ID ${id} not found`);
    }

    return localField;
  }

  async update(id: number, updateLocalFieldDto: Prisma.local_fieldsUpdateInput) {
    await this.findOne(id);

    if (updateLocalFieldDto.name || updateLocalFieldDto.abbreviation) {
      const existingLocalField = await this.prisma.local_fields.findFirst({
        where: {
          OR: [
            { name: updateLocalFieldDto.name as string },
            { abbreviation: updateLocalFieldDto.abbreviation as string },
            { unions: { name: updateLocalFieldDto.unions as string } }
          ],
          NOT: { local_field_id: id }
        }
      });

      if (existingLocalField) {
        throw new ConflictException('Local Field with this name or abbreviation already exists');
      }
    }

    return this.prisma.local_fields.update({
      where: { local_field_id: id },
      data: {
        ...updateLocalFieldDto,
        modified_at: new Date(),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      await this.prisma.local_fields.delete({ where: { local_field_id: id } });
      return {
        status: true,
        message: 'Local Field deleted successfully'
      };
    } catch (error) {
      throw new BadRequestException('Unable to delete Local Field');
    }
  }

  async softDelete(id: number) {
    await this.findOne(id);

    try {
      await this.prisma.local_fields.update({
        where: { local_field_id: id },
        data: { active: false },
      });
      return {
        status: true,
        message: 'Local Field deleted successfully'
      };
    } catch (error) {
      throw new BadRequestException('Unable to soft delete Local Field');
    }
  }
}