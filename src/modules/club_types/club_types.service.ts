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
export class ClubTypesService {

  private readonly logger = new Logger(ClubTypesService.name);

  constructor(private prisma: PrismaService) {}

  async create(createClubTypeDto: Prisma.club_typesCreateInput) {
    if (!createClubTypeDto.name) {
      throw new BadRequestException('Name are required');
    }

    const existingClubType = await this.prisma.club_types.findFirst({
      where: {
        name: createClubTypeDto.name,
      }
    });

    if (existingClubType) {
      throw new ConflictException('Club Type with this name already exists');
    }

    try {
      const newClubType = await this.prisma.club_types.create({
        data: createClubTypeDto,
      });

      const clubTypeDto = {
        ct_id: newClubType.ct_id,
        name: newClubType.name,
      }

      return clubTypeDto
    } catch (error) {
      throw new BadRequestException('Invalid data provided');
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.club_typesWhereUniqueInput;
    where?: Prisma.club_typesWhereInput;
    orderBy?: Prisma.club_typesOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.club_types.findMany({
      skip,
      take,
      cursor,
      where: { ...where, active: true },
      orderBy: orderBy || { ct_id: 'asc' },
    });
  }

  async findOne(id: number) {
    const club_types = await this.prisma.club_types.findUnique({
      where: { ct_id: id }
    });

    if (!club_types) {
      throw new NotFoundException(`Club Type with ID ${id} not found`);
    }

    return club_types;
  }

  async update(id: number, updateClubTypesDto: Prisma.club_typesUpdateInput) {
    await this.findOne(id);

    if (updateClubTypesDto.name) {
      const existingClubTypes = await this.prisma.club_types.findFirst({
        where: {
          OR: [
            { name: updateClubTypesDto.name as string }
          ],
          NOT: { ct_id: id }
        }
      });

      if (existingClubTypes) {
        throw new ConflictException('Club type with this name already exists');
      }
    }

    return this.prisma.club_types.update({
      where: { ct_id: id },
      data: {
        ...updateClubTypesDto,
        modified_at: new Date(),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      await this.prisma.club_types.delete({ where: { ct_id: id } });
      return {
        status: true,
        message: 'Club type deleted successfully'
      };
    } catch (error) {
      throw new BadRequestException('Unable to delete Club type');
    }
  }

  async softDelete(id: number) {
    await this.findOne(id);

    try {
      await this.prisma.club_types.update({
        where: { ct_id: id },
        data: { active: false },
      });
      return {
        status: true,
        message: 'Club type deleted successfully'
      };
    } catch (error) {
      throw new BadRequestException('Unable to soft delete Club type');
    }
  }
}