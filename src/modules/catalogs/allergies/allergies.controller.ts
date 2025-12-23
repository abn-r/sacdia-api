import { Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CatalogController } from '../../../common/decorators/catalog-controller.decorator';
import { ReadCatalog, CreateCatalog, UpdateCatalog, DeleteCatalog } from '../../../common/decorators/catalog-endpoint.decorator';
import { TransformResponse } from '../../../common/decorators/transform-response.decorator';
import { AllergiesService } from './allergies.service';

@CatalogController('allergies')
export class AllergiesController {
  constructor(private readonly allergiesService: AllergiesService) {}

  @Post()
  @CreateCatalog('ALLERGIES')
  @TransformResponse()
  create(@Body() createAllergiesDto: Prisma.allergiesCreateInput) {
    return this.allergiesService.create(createAllergiesDto);
  }

  @Get()
  @ReadCatalog('ALLERGIES')
  @TransformResponse({idField: 'allergy_id'})
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
    @Query('where') where?: string,
    @Query('orderBy') orderBy?: string
  ) {
    return await this.allergiesService.findAll({
      skip: +skip || 0,
      take: +take || 10,
      cursor: cursor ? { allergy_id: +cursor } : undefined,
      where: where ? JSON.parse(where) : undefined,
      orderBy: orderBy ? JSON.parse(orderBy) : undefined,
    });
  }

  @Get(':id')
  @ReadCatalog('ALLERGIES')
  @TransformResponse({idField: 'allergy_id'})
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.allergiesService.findOne(id);
  }

  @Patch(':id')
  @UpdateCatalog('ALLERGIES')
  @TransformResponse()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAllergiesDto: Prisma.allergiesUpdateInput
  ) {
    return this.allergiesService.update(id, updateAllergiesDto);
  }

  @Delete(':id')
  @DeleteCatalog('ALLERGIES')
  @TransformResponse()
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Query('soft') soft?: boolean
  ) {
    return soft
      ? this.allergiesService.softDelete(id)
      : this.allergiesService.remove(id);
  }
}
