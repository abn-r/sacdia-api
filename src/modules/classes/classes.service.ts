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
export class ClassesService {

  private readonly logger = new Logger(ClassesService.name);

  constructor(private prisma: PrismaService) {}

  async create(createClassDto: Prisma.classesCreateInput) {
    if (!createClassDto.name) {
      throw new BadRequestException('Name are required');
    }

    const existingClass = await this.prisma.classes.findFirst({
      where: {
        name: createClassDto.name,
      }
    });

    if (existingClass) {
      throw new ConflictException('Class with this name already exists');
    }

    try {
      const newClass = await this.prisma.classes.create({
        data: createClassDto,
      });

      const clubDto = {
        class_id: newClass.class_id,
        name: newClass.name,
      }

      return clubDto
    } catch (error) {
      throw new BadRequestException('Invalid data provided');
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.classesWhereUniqueInput;
    where?: Prisma.classesWhereInput;
    orderBy?: Prisma.classesOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.classes.findMany({
      skip,
      take,
      cursor,
      where: { ...where, active: true },
      orderBy: orderBy || { class_id: 'asc' },
      include: {
        club_types: { select: { name: true } }
      },
    });
  }

  async findOne(id: number) {
    const classes = await this.prisma.classes.findUnique({
      where: { class_id: id },
      include: {
        club_types: { select: { name: true } }
      },
    });

    if (!classes) {
      throw new NotFoundException(`Classes with ID ${id} not found`);
    }

    return classes;
  }

  async update(id: number, updateClassesDto: Prisma.classesUpdateInput) {
    await this.findOne(id);

    if (updateClassesDto.name) {
      const existingClasses = await this.prisma.classes.findFirst({
        where: {
          name: updateClassesDto.name as string
        }
      });

      if (existingClasses) {
        throw new ConflictException('Classes with this name already exists');
      }
    }

    return this.prisma.classes.update({
      where: { class_id: id },
      data: {
        ...updateClassesDto,
        modified_at: new Date(),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      await this.prisma.classes.delete({ where: { class_id: id } });
      return {
        status: true,
        message: 'Class deleted successfully'
      };
    } catch (error) {
      throw new BadRequestException('Unable to delete Class');
    }
  }

  async softDelete(id: number) {
    await this.findOne(id);

    try {
      await this.prisma.classes.update({
        where: { class_id: id },
        data: { active: false },
      });
      return {
        status: true,
        message: 'Class deleted successfully'
      };
    } catch (error) {
      throw new BadRequestException('Unable to soft delete Class');
    }
  }
}