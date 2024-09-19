import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Countries } from './countries.model';
import { Prisma } from '@prisma/client';

@Injectable()
export class CountriesService {

  // Declare a method that returns a promise of an array of Country objects
  constructor(private readonly prisma: PrismaService) {}

  async create(createCountryDto: Prisma.countriesCreateInput) {
    let country = this.prisma.countries.findFirst({
      where: {
        name: createCountryDto.name,
      }
    })

    if (country) throw new NotFoundException(`Country not found`);

    return this.prisma.countries.create({
      data: createCountryDto
    });
  }


  async findAll(): Promise<Countries[]> {
    return await this.prisma.countries.findMany({
      where: { active: true },
      orderBy: [
        { country_id: 'asc' }
      ],
    });
  }

  async findOne(id: number) {
    return this.prisma.countries.findUnique({
      where: {
        country_id: id
      }
    });
  }

  async update(id: number, updateCountryDto: Prisma.countriesUpdateInput) {
    const country = this.findOne(id);

    if (!country) throw new NotFoundException(`Country not found`);

    return this.prisma.countries.update({
      where: {
        country_id: id
      },
      data: updateCountryDto
    });
  }

  async remove(id: number) {
    return this.prisma.countries.delete({
      where: {
        country_id: id
      }
    });
  }
}
