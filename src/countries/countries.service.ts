import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Countries } from './countries.model';
import { Prisma } from '@prisma/client';

@Injectable()
export class CountriesService {

  // Declare a method that returns a promise of an array of Country objects
  constructor(private readonly prisma: PrismaService) {}

  async create(createCountryDto: Prisma.countriesCreateInput) {
    // Validate input
    if (!createCountryDto.name || !createCountryDto.abbreviation)
      throw new BadRequestException('Name and abbreviation are required');


    // Check if country already exists
    const existingCountry = await this.prisma.countries.findFirst({
      where: {
        OR: [
          { name: createCountryDto.name },
          { abbreviation: createCountryDto.abbreviation }
        ]
      }
    });

    if (existingCountry) throw new ConflictException('Country with this name or abbreviation already exists');


    try {
      return await this.prisma.countries.create({
        data: createCountryDto,
      });
    } catch (error) {
      throw new BadRequestException('Invalid data provided');
    }
  }


  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.countriesWhereUniqueInput;
    where?: Prisma.countriesWhereInput;
    orderBy?: Prisma.countriesOrderByWithRelationInput;
  }): Promise<Countries[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.countries.findMany({
      skip,
      take,
      cursor,
      where: { ...where, active: true },
      orderBy: orderBy || { country_id: 'asc' },
    });
  }

  async findOne(id: number): Promise<Countries> {
    const country = await this.prisma.countries.findUnique({
      where: { country_id: id },
    });

    if (!country) throw new NotFoundException(`Country with ID ${id} not found`);

    return country;
  }

  async update(id: number, updateCountryDto: Prisma.countriesUpdateInput): Promise<Countries> {
    await this.findOne(id);

    // Check if new name or abbreviation already exists
    if (updateCountryDto.name || updateCountryDto.abbreviation) {
      const existingCountry = await this.prisma.countries.findFirst({
        where: {
          OR: [
            { name: updateCountryDto.name as string },
            { abbreviation: updateCountryDto.abbreviation as string }
          ],
          NOT: { country_id: id }
        }
      });

      if (existingCountry)
        throw new ConflictException('Country with this name or abbreviation already exists');
    }

    // Update country
    return this.prisma.countries.update({
      where: { country_id: id },
      data: {
        ...updateCountryDto,
        modified_at: new Date
      },
    });
  }


  async remove(id: number): Promise<void> {
    await this.findOne(id);

    try {
      await this.prisma.countries.delete({
        where: { country_id: id },
      });
    } catch (error) {
      throw new BadRequestException('Unable to delete country');
    }
  }

  async softDelete(id: number): Promise<Countries> {
    await this.findOne(id);

    try {
      return await this.prisma.countries.update({
        where: { country_id: id },
        data: { active: false },
      });
    } catch (error) {
      throw new BadRequestException('Unable to soft delete country');
    }
  }
}
