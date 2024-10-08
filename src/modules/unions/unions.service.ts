// import {
//   BadRequestException,
//   ConflictException,
//   Injectable,
//   NotFoundException
// } from '@nestjs/common';
// import { PrismaService } from '../../prisma.service';
// import { Prisma } from '@prisma/client';
// import { Unions } from './unions.model';

// @Injectable()
// export class UnionsService {
//   // Declare a method that returns a promise of an array of Union objects
//   constructor(private readonly prisma: PrismaService) {}

//   async create(createUnionDto: Prisma.unionsCreateInput) {
//     // Validate input
//     if (!createUnionDto.name || !createUnionDto.abbreviation)
//       throw new BadRequestException('Name and abbreviation are required');

//     // Check if Union already exists
//     const existingUnion = await this.prisma.unions.findFirst({
//       where: {
//         OR: [
//           { name: createUnionDto.name },
//           { abbreviation: createUnionDto.abbreviation }
//         ]
//       }
//     });

//     if (existingUnion) throw new ConflictException('Union with this name or abbreviation already exists');

//     try {
//       return await this.prisma.unions.create({
//         data: createUnionDto,
//       });
//     } catch (error) {
//       throw new BadRequestException('Invalid data provided');
//     }
//   }


//   async findAll(params: {
//     skip?: number;
//     take?: number;
//     cursor?: Prisma.unionsWhereUniqueInput;
//     where?: Prisma.unionsWhereInput;
//     orderBy?: Prisma.unionsOrderByWithRelationInput;
//   }): Promise<(Omit<Unions, 'countries'> & { countries: { name: string } })[]> {//}): Promise<Unions[]> {
//     const { skip, take, cursor, where, orderBy } = params;
//     return this.prisma.unions.findMany({
//       skip,
//       take,
//       cursor,
//       where: { ...where, active: true },
//       orderBy: orderBy || { union_id: 'asc' },
//       include: { countries: { select: { name: true } } },
//     });
//   }

//   async findOne(id: number): Promise<Omit<Unions, 'countries'> & { countries: { name: string } }> {
//     const union = await this.prisma.unions.findUnique({
//       where: { union_id: id },
//       include: { countries: { select: { name: true } } },
//     });

//     if (!union) throw new NotFoundException(`Union with ID ${id} not found`);

//     return union;
//   }

//   async update(id: number, updateUnionDto: Prisma.unionsUpdateInput): Promise<Omit<Unions, 'countries'> & { countries: { name: string } }> {
//     await this.findOne(id);

//     // Check if new name or abbreviation already exists
//     if (updateUnionDto.name || updateUnionDto.abbreviation) {
//       const existingUnion = await this.prisma.unions.findFirst({
//         where: {
//           OR: [
//             { name: updateUnionDto.name as string },
//             { abbreviation: updateUnionDto.abbreviation as string }
//           ],
//           NOT: { union_id: id }
//         }
//       });

//       if (existingUnion)
//         throw new ConflictException('Union with this name or abbreviation already exists');
//     }

//     // Update Union
//     return this.prisma.unions.update({
//       where: { union_id: id },
//       data: {
//         ...updateUnionDto,
//         modified_at: new Date
//       },
//       include: { countries: { select: { name: true } } },
//     });
//   }


//   async remove(id: number): Promise<void> {
//     await this.findOne(id);

//     try {
//       await this.prisma.unions.delete({
//         where: { union_id: id },
//       });
//     } catch (error) {
//       throw new BadRequestException('Unable to delete Union');
//     }
//   }

//   async softDelete(id: number): Promise<Omit<Unions, 'countries'> & { countries: { name: string } }> {
//     await this.findOne(id);

//     try {
//       return await this.prisma.unions.update({
//         where: { union_id: id },
//         data: { active: false },
//         include: { countries: { select: { name: true } } },
//       });
//     } catch (error) {
//       throw new BadRequestException('Unable to soft delete Union');
//     }
//   }
// }
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ParseIntPipe
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UnionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUnionDto: Prisma.unionsCreateInput) {
    if (!createUnionDto.name || !createUnionDto.abbreviation) {
      throw new BadRequestException('Name and abbreviation are required');
    }

    const existingUnion = await this.prisma.unions.findFirst({
      where: {
        OR: [
          { name: createUnionDto.name },
          { abbreviation: createUnionDto.abbreviation }
        ]
      }
    });

    if (existingUnion) {
      throw new ConflictException('Union with this name or abbreviation already exists');
    }

    try {
      return await this.prisma.unions.create({
        data: createUnionDto,
      });
    } catch (error) {
      throw new BadRequestException('Invalid data provided');
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.unionsWhereUniqueInput;
    where?: Prisma.unionsWhereInput;
    orderBy?: Prisma.unionsOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.unions.findMany({
      skip,
      take,
      cursor,
      where: { ...where, active: true },
      orderBy: orderBy || { union_id: 'asc' },
      include: { countries: { select: { name: true } } },
    });
  }

  async findOne(id: number) {
    const union = await this.prisma.unions.findUnique({
      where: { union_id: id },
      select: {
        union_id: true,
        name: true,
        abbreviation: true,
        active: true,
        local_fields: true,
        countries: { select: { country_id: true, name: true } },
      }
    });

    if (!union) {
      throw new NotFoundException(`Union with ID ${id} not found`);
    }

    return union;
  }

  async update(id: number, updateUnionDto: Prisma.unionsUpdateInput) {
    await this.findOne(id);

    if (updateUnionDto.name || updateUnionDto.abbreviation) {
      const existingUnion = await this.prisma.unions.findFirst({
        where: {
          OR: [
            { name: updateUnionDto.name as string },
            { abbreviation: updateUnionDto.abbreviation as string }
          ],
          NOT: { union_id: id }
        }
      });

      if (existingUnion) {
        throw new ConflictException('Union with this name or abbreviation already exists');
      }
    }

    return this.prisma.unions.update({
      where: { union_id: id },
      data: {
        ...updateUnionDto,
        modified_at: new Date(),
      },
    });
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    try {
      await this.prisma.unions.delete({ where: { union_id: id } });
    } catch (error) {
      throw new BadRequestException('Unable to delete union');
    }
  }

  async softDelete(id: number) {
    await this.findOne(id);
    try {
      return await this.prisma.unions.update({
        where: { union_id: id },
        data: { active: false },
      });
    } catch (error) {
      throw new BadRequestException('Unable to soft delete union');
    }
  }
}