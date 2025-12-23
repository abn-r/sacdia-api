import { Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CatalogController } from '../../../common/decorators/catalog-controller.decorator';
import { ReadCatalog, CreateCatalog, UpdateCatalog, DeleteCatalog } from '../../../common/decorators/catalog-endpoint.decorator';
import { TransformResponse } from '../../../common/decorators/transform-response.decorator';
import { HonorsService } from './honors.service';

@CatalogController('honors')
export class HonorsController {
  constructor(private readonly honorsService: HonorsService) {}

  @Post()
  @CreateCatalog('HONORS')
  @TransformResponse()
  create(@Body() createHonorDto: Prisma.honorsCreateInput) {
    return this.honorsService.create(createHonorDto);
  }

  @Post('many')
  @CreateCatalog('HONORS')
  @TransformResponse()
  createMany(@Body() createHonorDto: Prisma.honorsCreateManyInput[]) {
    return this.honorsService.createMany(createHonorDto);
  }

  @Get()
  @ReadCatalog('HONORS')
  @TransformResponse({ idField: 'honor_id' })
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
    @Query('where') where?: string,
    @Query('orderBy') orderBy?: string
  ) {
    return await this.honorsService.findAll({
      skip: +skip || 0,
      take: +take || 100,
      cursor: cursor ? { honor_id: +cursor } : undefined,
      where: where ? JSON.parse(where) : undefined,
      orderBy: orderBy ? JSON.parse(orderBy) : undefined,
    });
  }

  @Get('by-category')
  @ReadCatalog('HONORS')
  @TransformResponse()
  findAllGroupedByCategory() {
    return this.honorsService.findAllGroupedByCategory();
  }

  @Get('search')
  @ReadCatalog('HONORS')
  @TransformResponse({ idField: 'honor_id' })
  search(@Query('term') term: string) {
    return this.honorsService.search(term);
  }

  @Get(':id')
  @ReadCatalog('HONORS')
  @TransformResponse({ idField: 'honor_id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.honorsService.findOne(+id);
  }

  @Patch(':id')
  @UpdateCatalog('HONORS')
  @TransformResponse()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHonorDto: Prisma.honorsUpdateInput
  ) {
    return this.honorsService.update(id, updateHonorDto);
  }

  @Delete(':id')
  @DeleteCatalog('HONORS')
  @TransformResponse()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.honorsService.softDelete(id);
  }
} 