import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { Countries } from './countries.model';
import { Prisma } from '@prisma/client';

@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Post('signout')
  @Post()
  create(@Body() createCountryDto: Prisma.countriesCreateInput) {
    return this.countriesService.create(createCountryDto);
  }

  @Get()
  async findAll(): Promise<Countries[]> { 
    return await this.countriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.countriesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCountryDto: Prisma.countriesUpdateInput) {
    return this.countriesService.update(+id, updateCountryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.countriesService.remove(+id);
  }
}
