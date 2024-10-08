import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';


@Injectable()
export class ChurchesService {
  constructor(private prisma: PrismaService) {}

  async create(createChurchDto: Prisma.churchesUncheckedCreateInput) {

    if (!createChurchDto.name) {
      throw new BadRequestException('Name are required');
    }

    const existingChurch = await this.prisma.churches.findFirst({
      where: {
        name: createChurchDto.name
      }
    });

    if (existingChurch) throw new ConflictException('Church with this name already exists');

    try {
      const church = await this.prisma.churches.create({
        data: createChurchDto,
      });

      const newChurch = {
        church_id: church.church_id,
        name: church.name,
      }

      return newChurch;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('A district with this name already exists');
        }
        if (error.code === 'P2025') {
          throw new BadRequestException(`The specified church does not exist`);
        }
      }
      throw new BadRequestException(`Could not create district: ${error.message}`);
    }

  }

  async findAll(
    params: {
      skip?: number;
      take?: number;
      cursor?: Prisma.churchesWhereUniqueInput;
      where?: Prisma.churchesWhereInput;
      orderBy?: Prisma.churchesOrderByWithRelationInput;
    }
  ) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.churches.findMany({
      skip,
      take,
      cursor,
      where: { ...where, active: true },
      orderBy: orderBy || { district_id: 'asc' },
      include: { districts: { select: { name: true } } }
    });
  }

  findOne(churchesWhereUniqueInput: Prisma.churchesWhereUniqueInput) {
    const church = this.prisma.churches.findUnique({
      where: churchesWhereUniqueInput,
      select: {
        church_id: true,
        name: true,
        active: true,
        district_id: true,
        districts: { select: { name: true } },
      },
    });

    if (!church) {
      throw new NotFoundException(`Churches with ID ${churchesWhereUniqueInput.church_id} not found`);
    }
    return church;
  }

  async update(
    where: Prisma.churchesWhereUniqueInput,
    updateChurchDto: Prisma.churchesUpdateInput,
  ) {
    await this.findOne({ church_id: where.church_id });

    if (updateChurchDto.name || updateChurchDto.districts) {
      const existingChurch = await this.prisma.churches.findFirst({
        where: {
          OR: [
            { name: updateChurchDto.name as string },
            { district_id: updateChurchDto.districts.connect?.district_id as number }
          ],
          NOT: { church_id: where.church_id }
        }
      });

      if (existingChurch) {
        throw new ConflictException('Church with this name already exists');
      }
    }

    try {
      this.prisma.churches.update({
        where,
        data: {
          ...updateChurchDto,
          modified_at: new Date(),
        },
      })

      return {
        status: true,
        message: `Church "${updateChurchDto.name}" updated successfully`
      }
    } catch (error) {
      throw new BadRequestException('Unable to soft delete Districts');
    }
  }

  async remove(where: Prisma.churchesWhereUniqueInput) {
    //return this.prisma.churches.delete({ where });

    await this.findOne(where);

    try {
      await this.prisma.churches.update({
        where,
        data: { active: false },
      });
      return {
        status: true,
        message: 'Church deleted successfully'
      };
    } catch (error) {
      throw new BadRequestException('Unable to soft delete Districts');
    }
  }
}