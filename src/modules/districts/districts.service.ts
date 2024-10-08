import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Logger
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Prisma } from '@prisma/client';
import { CreateDistrictDto } from './dtos/districts.dto';

@Injectable()
export class DistrictsService {
  private readonly logger = new Logger(DistrictsService.name);

  constructor(private prisma: PrismaService) {}

  // async create(createDistrictDto: CreateDistrictDto) {

  //   const { local_field_id, ...districtData } = createDistrictDto;

  //   try {
  //     const localField = await this.prisma.local_fields.findUnique({
  //       where: { local_field_id: local_field_id }
  //     });
  //     if (!localField) {
  //       this.logger.error(`Local field with id ${local_field_id} does not exist`);
  //       throw new BadRequestException(`The specified local_field_id (${local_field_id}) does not exist`);
  //     }
  //     this.logger.log(`Local field with id ${local_field_id} exists`);
  //   } catch (error) {
  //     this.logger.error(`Error checking local field: ${error.message}`);
  //     throw new BadRequestException(`Error checking local field: ${error.message}`);
  //   }

  //   try {
  //     const existingDistrict = await this.prisma.districts.findFirst({
  //       where: { name: districtData.name }
  //     });

  //     if (existingDistrict) {
  //       this.logger.warn(`District with name "${districtData.name}" already exists. District ID: ${existingDistrict.district_id}`);
  //       throw new ConflictException(`A district with the name "${districtData.name}" already exists. District ID: ${existingDistrict.district_id}`);
  //     }
  //     this.logger.log(`No existing district found with name "${districtData.name}"`);
  //   } catch (error) {
  //     if (error instanceof ConflictException) {
  //       throw error;
  //     }
  //     this.logger.error(`Error checking existing district: ${error.message}`);
  //     throw new BadRequestException(`Error checking existing district: ${error.message}`);
  //   }

  //   const districtCreateInput: Prisma.districtsCreateInput = {
  //     ...districtData,
  //     local_fields: {
  //       connect: { local_field_id: local_field_id }
  //     }
  //   };

  //   try {
  //     this.logger.log(`Attempting to create district with input: ${JSON.stringify(districtCreateInput)}`);
  //     const newDistrict = await this.prisma.districts.create({
  //       data: districtCreateInput,
  //     });
  //     this.logger.log(`District created successfully: ${JSON.stringify(newDistrict)}`);
  //     return newDistrict;
  //   } catch (error) {
  //     this.logger.error(`Error creating district: ${error.message}`);
  //     if (error instanceof Prisma.PrismaClientKnownRequestError) {
  //       if (error.code === 'P2002') {
  //         throw new ConflictException('A district with this name already exists');
  //       }
  //       if (error.code === 'P2025') {
  //         throw new BadRequestException(`The specified local_field_id (${local_field_id}) does not exist`);
  //       }
  //     }
  //     throw new BadRequestException(`Could not create district: ${error.message}`);
  //   }
  // }

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
      throw new ConflictException('Local Field with this name already exists');
    }

    try {
      const newLF = await this.prisma.districts.create({
        data: createDistrictDto,
      });

      const ldistrictDto = {
        district_id: newLF.district_id,
        name: newLF.name,
      }

      return ldistrictDto
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
            { local_fields: { name: updateDistrictsDto.local_fields as string } },
            { local_fields: { abbreviation: updateDistrictsDto.local_fields as string } }
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