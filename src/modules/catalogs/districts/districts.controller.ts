import { Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CatalogController } from '../../../common/decorators/catalog-controller.decorator';
import { ReadCatalog, CreateCatalog, UpdateCatalog, DeleteCatalog } from '../../../common/decorators/catalog-endpoint.decorator';
import { TransformResponse } from '../../../common/decorators/transform-response.decorator';
import { Districts } from './districts.model';
import { DistrictsService } from './districts.service';

@CatalogController('districts')
export class DistrictsController {
  constructor(private readonly districtsService: DistrictsService) {}

  @Post()
  @CreateCatalog('DISTRICTS')
  @TransformResponse()
  create(@Body() createDistrictDto: Prisma.districtsCreateInput) {
    return this.districtsService.create(createDistrictDto);
  }

  @Post('many')
  @CreateCatalog('DISTRICTS')
  @TransformResponse()
  createMany(@Body() createDistrictDto: Prisma.districtsCreateInput[]) {
    return this.districtsService.createMany(createDistrictDto);
  }

  @Get()
  @ReadCatalog('DISTRICTS')
  @TransformResponse({ idField: 'district_id' })
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
    @Query('where') where?: string,
    @Query('orderBy') orderBy?: string
  ) {
    return await this.districtsService.findAll({
      skip: +skip || 0,
      take: +take || 100,
      cursor: cursor ? { district_id: +cursor } : undefined,
      where: where ? JSON.parse(where) : undefined,
      orderBy: orderBy ? JSON.parse(orderBy) : undefined,
    });
  }

  @Get(':id')
  @ReadCatalog('DISTRICTS')
  @TransformResponse({ idField: 'district_id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.districtsService.findOne(+id);
  }

  @Get('by-local-field/:localFieldId')
  @ReadCatalog('DISTRICTS')
  @TransformResponse({ idField: 'district_id' })
  findByLocalField(@Param('localFieldId', ParseIntPipe) localFieldId: number) {
    return this.districtsService.findByLocalField(+localFieldId);
  }

  @Get('search')
  @ReadCatalog('DISTRICTS')
  @TransformResponse({ idField: 'district_id' })
  search(@Query('term') term: string) {
    return this.districtsService.search(term);
  }

  @Patch(':id')
  @UpdateCatalog('DISTRICTS')
  @TransformResponse()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDistrictDto: Prisma.districtsUpdateInput
  ) {
    return this.districtsService.update(id, updateDistrictDto);
  }

  @Delete(':id')
  @DeleteCatalog('DISTRICTS')
  @TransformResponse()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.districtsService.softDelete(id);
  }
}