import { Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UnionsService } from './unions.service';
import { CatalogController } from '../../../common/decorators/catalog-controller.decorator';
import { ReadCatalog, CreateCatalog, UpdateCatalog, DeleteCatalog } from '../../../common/decorators/catalog-endpoint.decorator';
import { TransformResponse } from '../../../common/decorators/transform-response.decorator';

@CatalogController('unions')
export class UnionsController {
  constructor(private readonly unionsService: UnionsService) {}

  @Post()
  @CreateCatalog('UNIONS')
  @TransformResponse()
  create(@Body() createUnionDto: Prisma.unionsCreateInput) {
    return this.unionsService.create(createUnionDto);
  }

  @Post('many')
  @CreateCatalog('UNIONS')
  @TransformResponse()
  createMany(@Body() createUnionsDto: Prisma.unionsCreateInput[]) {
    return this.unionsService.createMany(createUnionsDto);
  }

  @Get()
  @ReadCatalog('UNIONS')
  @TransformResponse({ idField: 'union_id' })
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
    @Query('where') where?: string,
    @Query('orderBy') orderBy?: string
  ): Promise<{ status: boolean, data: any[], total: number }> {
    return await this.unionsService.findAll({
      skip: +skip || 0,
      take: +take || 10,
      cursor: cursor ? { union_id: +cursor } : undefined,
      where: where ? JSON.parse(where) : undefined,
      orderBy: orderBy ? JSON.parse(orderBy) : undefined,
    });
  }

  @Get(':id')
  @ReadCatalog('UNIONS')
  @TransformResponse({ idField: 'union_id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.unionsService.findOne(+id);
  }

  @Get('by-country/:countryId')
  @ReadCatalog('UNIONS')
  @TransformResponse({ idField: 'union_id' })
  findByCountry(@Param('countryId', ParseIntPipe) countryId: number) {
    return this.unionsService.findByCountry(+countryId);
  }

  @Get('search')
  @ReadCatalog('UNIONS')
  @TransformResponse({ idField: 'union_id' })
  search(@Query('term') term: string) {
    return this.unionsService.search(term);
  }

  @Patch(':id')
  @UpdateCatalog('UNIONS')
  @TransformResponse()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUnionDto: Prisma.unionsUpdateInput
  ) {
    return this.unionsService.update(id, updateUnionDto);
  }

  @Delete(':id')
  @DeleteCatalog('UNIONS')
  @TransformResponse()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.unionsService.softDelete(id);
  }
}

