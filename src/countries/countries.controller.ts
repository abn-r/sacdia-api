import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, ParseIntPipe, Query } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { Countries } from './countries.model';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { skip } from 'node:test';

@Controller('countries')
@UseGuards(JwtAuthGuard)
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Post()
  create(@Body() createCountryDto: Prisma.countriesCreateInput) {
    return this.countriesService.create(createCountryDto);
  }

  @Get()
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
    @Query('where') where?: string,
    @Query('orderBy') orderBy?: string
  ): Promise<Countries[]> {
    return await this.countriesService.findAll({
      skip: +skip || 0,
      take: +take || 10,
      cursor: cursor ? { country_id: +cursor } : undefined,
      where: where ? JSON.parse(where) : undefined,
      orderBy: orderBy ? JSON.parse(orderBy) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.countriesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: string, @Body() updateCountryDto: Prisma.countriesUpdateInput) {
    return this.countriesService.update(+id, updateCountryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number, @Query('soft') soft?: boolean) {
    return soft
      ? this.countriesService.softDelete(id)
      : this.countriesService.remove(id);
  }
}
