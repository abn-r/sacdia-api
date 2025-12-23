import { Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CatalogController } from '../../../common/decorators/catalog-controller.decorator';
import { ReadCatalog, CreateCatalog, UpdateCatalog, DeleteCatalog } from '../../../common/decorators/catalog-endpoint.decorator';
import { TransformResponse } from '../../../common/decorators/transform-response.decorator';
import { Diseases } from './diseases.model';
import { DiseasesService } from './diseases.service';

@CatalogController('diseases')
export class DiseasesController {
  constructor(private readonly diseasesService: DiseasesService) {}

  @Post()
  @CreateCatalog('DISEASES')
  @TransformResponse()
  create(@Body() createDiseaseDto: Prisma.diseasesCreateInput) {
    return this.diseasesService.create(createDiseaseDto);
  }

  @Post('many')
  @CreateCatalog('DISEASES')
  @TransformResponse()
  createMany(@Body() createDiseaseDto: Prisma.diseasesCreateInput[]) {
    return this.diseasesService.createMany(createDiseaseDto);
  }

  @Get()
  @ReadCatalog('DISEASES')
  @TransformResponse({ idField: 'disease_id' })
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
    @Query('where') where?: string,
    @Query('orderBy') orderBy?: string
  ): Promise<{ status: boolean, data: Diseases[], total: number }> {
    return await this.diseasesService.findAll({
      skip: +skip || 0,
      take: +take || 10,
      cursor: cursor ? { disease_id: +cursor } : undefined,
      where: where ? JSON.parse(where) : undefined,
      orderBy: orderBy ? JSON.parse(orderBy) : undefined,
    });
  }

  @Get(':id')
  @ReadCatalog('DISEASES')
  @TransformResponse({ idField: 'disease_id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.diseasesService.findOne(+id);
  }

  @Get('search')
  @ReadCatalog('DISEASES')
  @TransformResponse({ idField: 'disease_id' })
  search(@Query('term') term: string) {
    return this.diseasesService.search(term);
  }

  @Patch(':id')
  @UpdateCatalog('DISEASES')
  @TransformResponse()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDiseaseDto: Prisma.diseasesUpdateInput
  ) {
    return this.diseasesService.update(id, updateDiseaseDto);
  }

  @Delete(':id')
  @DeleteCatalog('DISEASES')
  @TransformResponse()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.diseasesService.softDelete(id);
  }
}