import { Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CatalogController } from '../../../common/decorators/catalog-controller.decorator';
import { ReadCatalog, CreateCatalog, UpdateCatalog, DeleteCatalog } from '../../../common/decorators/catalog-endpoint.decorator';
import { TransformResponse } from '../../../common/decorators/transform-response.decorator';
import { HonorsCategoriesService } from './honors-categories.service';

@CatalogController('honors-categories')
export class HonorsCategoriesController {
  constructor(private readonly honorsCategoriesService: HonorsCategoriesService) {}

  @Post()
  @CreateCatalog('HONORS_CATEGORIES')
  @TransformResponse()
  create(@Body() createHonorCategoryDto: Prisma.honors_categoriesCreateInput) {
    return this.honorsCategoriesService.create(createHonorCategoryDto);
  }

  @Post('many')
  @CreateCatalog('HONORS_CATEGORIES')
  @TransformResponse()
  createMany(@Body() createHonorCategoryDto: Prisma.honors_categoriesCreateManyInput[]) {
    return this.honorsCategoriesService.createMany(createHonorCategoryDto);
  }

  @Get()
  @ReadCatalog('HONORS_CATEGORIES')
  @TransformResponse({ idField: 'honor_category_id' })
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
    @Query('where') where?: string,
    @Query('orderBy') orderBy?: string
  ) {
    return await this.honorsCategoriesService.findAll({
      skip: +skip || 0,
      take: +take || 100,
      cursor: cursor ? { honor_category_id: +cursor } : undefined,
      where: where ? JSON.parse(where) : undefined,
      orderBy: orderBy ? JSON.parse(orderBy) : undefined,
    });
  }

  @Get(':id')
  @ReadCatalog('HONORS_CATEGORIES')
  @TransformResponse({ idField: 'honor_category_id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.honorsCategoriesService.findOne(+id);
  }

  @Get('search')
  @ReadCatalog('HONORS_CATEGORIES')
  @TransformResponse({ idField: 'honor_category_id' })
  search(@Query('term') term: string) {
    return this.honorsCategoriesService.search(term);
  }

  @Patch(':id')
  @UpdateCatalog('HONORS_CATEGORIES')
  @TransformResponse()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHonorCategoryDto: Prisma.honors_categoriesUpdateInput
  ) {
    return this.honorsCategoriesService.update(id, updateHonorCategoryDto);
  }

  @Delete(':id')
  @DeleteCatalog('HONORS_CATEGORIES')
  @TransformResponse()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.honorsCategoriesService.softDelete(id);
  }
} 