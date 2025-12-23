import { Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CatalogController } from '../../../common/decorators/catalog-controller.decorator';
import { ReadCatalog, CreateCatalog, UpdateCatalog, DeleteCatalog } from '../../../common/decorators/catalog-endpoint.decorator';
import { TransformResponse } from '../../../common/decorators/transform-response.decorator';
import { Countries } from './countries.model';
import { CountriesService } from './countries.service';

@CatalogController('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Post()
  @CreateCatalog('COUNTRIES')
  @TransformResponse()
  create(@Body() createCountryDto: Prisma.countriesCreateInput) {
    return this.countriesService.create(createCountryDto);
  }

  @Post('many')
  @CreateCatalog('COUNTRIES')
  @TransformResponse()
  createMany(@Body() createCountryDto: Prisma.countriesCreateInput[]) {
    return this.countriesService.createMany(createCountryDto);
  }

  @Get()
  @ReadCatalog('COUNTRIES')
  @TransformResponse({ idField: 'country_id' })
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
    @Query('where') where?: string,
    @Query('orderBy') orderBy?: string
  ): Promise<{ status: boolean, data: Countries[], total: number }> {
    return await this.countriesService.findAll({
      skip: +skip || 0,
      take: +take || 100,
      cursor: cursor ? { country_id: +cursor } : undefined,
      where: where ? JSON.parse(where) : undefined,
      orderBy: orderBy ? JSON.parse(orderBy) : undefined,
    });
  }

  @Get(':id')
  @ReadCatalog('COUNTRIES')
  @TransformResponse({ idField: 'country_id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.countriesService.findOne(+id);
  }

  @Get('search')
  @ReadCatalog('COUNTRIES')
  @TransformResponse({ idField: 'country_id' })
  search(@Query('term') term: string) {
    return this.countriesService.search(term);
  }

  @Patch(':id')
  @UpdateCatalog('COUNTRIES')
  @TransformResponse()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCountryDto: Prisma.countriesUpdateInput
  ) {
    return this.countriesService.update(id, updateCountryDto);
  }

  @Delete(':id')
  @DeleteCatalog('COUNTRIES')
  @TransformResponse()
  remove(
    @Param('id', ParseIntPipe) id: number,
    //@Query('soft') soft?: boolean
  ) {
      // return soft
      //   ? this.countriesService.softDelete(id)
      //   : this.countriesService.remove(id);
      return this.countriesService.softDelete(id);
  }
}
