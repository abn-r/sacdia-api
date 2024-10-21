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
export class ClubsService {
  private readonly logger = new Logger(ClubsService.name);

  constructor(private prisma: PrismaService) {}

  async create(createClubDto: Prisma.clubsCreateInput) {
    if (!createClubDto.name) {
      throw new BadRequestException('Name are required');
    }

    const existingClub = await this.prisma.clubs.findFirst({
      where: {
        name: createClubDto.name,
      }
    });

    if (existingClub) {
      throw new ConflictException('Club with this name already exists');
    }

    try {
      const newClub = await this.prisma.clubs.create({
        data: createClubDto,
      });

      const clubDto = {
        club_id: newClub.club_id,
        name: newClub.name,
      }

      return clubDto
    } catch (error) {
      throw new BadRequestException('Invalid data provided');
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.clubsWhereUniqueInput;
    where?: Prisma.clubsWhereInput;
    orderBy?: Prisma.clubsOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.clubs.findMany({
      skip,
      take,
      cursor,
      where: { ...where, active: true },
      orderBy: orderBy || { club_id: 'asc' },
      include: {
        local_fields: { select: { name: true } },
        districts: { select: { name: true } },
        churches: { select: { name: true } }
      },
    });
  }

  async findOne(id: number) {
    const clubs = await this.prisma.clubs.findUnique({
      where: { club_id: id },
      include: {
        local_fields: { select: { name: true } },
        districts: { select: { name: true } },
        churches: { select: { name: true } }
      },
    });

    if (!clubs) {
      throw new NotFoundException(`Clubs with ID ${id} not found`);
    }

    return clubs;
  }

  async update(id: number, updateClubsDto: Prisma.clubsUpdateInput) {
    await this.findOne(id);

    if (updateClubsDto.name) {
      const existingClubs = await this.prisma.clubs.findFirst({
        where: {
          OR: [
            { name: updateClubsDto.name as string },
            { local_fields: { name: updateClubsDto.local_fields as string } },
            { local_fields: { abbreviation: updateClubsDto.local_fields as string } }
          ],
          NOT: { local_field_id: id }
        }
      });

      if (existingClubs) {
        throw new ConflictException('Clubs with this name already exists');
      }
    }

    return this.prisma.clubs.update({
      where: { club_id: id },
      data: {
        ...updateClubsDto,
        modified_at: new Date(),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      await this.prisma.clubs.delete({ where: { club_id: id } });
      return {
        status: true,
        message: 'Clubs deleted successfully'
      };
    } catch (error) {
      throw new BadRequestException('Unable to delete Clubs');
    }
  }

  async softDelete(id: number) {
    await this.findOne(id);

    try {
      await this.prisma.clubs.update({
        where: { club_id: id },
        data: { active: false },
      });
      return {
        status: true,
        message: 'Clubs deleted successfully'
      };
    } catch (error) {
      throw new BadRequestException('Unable to soft delete Clubs');
    }
  }
}