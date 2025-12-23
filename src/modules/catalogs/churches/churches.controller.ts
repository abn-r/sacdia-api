import { Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Churches } from './churches.model';
import { ChurchesService } from './churches.service';
import { CatalogController } from '../../../common/decorators/catalog-controller.decorator';
import { CreateCatalog, ReadCatalog, UpdateCatalog, DeleteCatalog } from '../../../common/decorators/catalog-endpoint.decorator';
import { TransformResponse } from '../../../common/decorators/transform-response.decorator';

@CatalogController('churches')
export class ChurchesController {
  constructor(private readonly churchesService: ChurchesService) {}

  @Post()
  @CreateCatalog('CHURCHES')
  @TransformResponse()
  create(@Body() createChurchDto: Prisma.churchesUncheckedCreateInput) {
    return this.churchesService.create(createChurchDto);
  }

  @Get()
  @ReadCatalog('CHURCHES')
  @TransformResponse({ idField: 'church_id' })
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
    @Query('where') where?: string,
    @Query('orderBy') orderBy?: string
  ): Promise<{ status: boolean, data: Churches[], total: number }> {
    const churches = await this.churchesService.findAll({
      skip: +skip || 0,
      take: +take || 100,
      cursor: cursor ? { church_id: +cursor } : undefined,
      where: where ? JSON.parse(where) : undefined,
      orderBy: orderBy ? JSON.parse(orderBy) : undefined,
    });

    return {
      status: true,
      data: churches,
      total: churches.length
    };
  }

  @Get(':id')
  @ReadCatalog('CHURCHES')
  @TransformResponse({ idField: 'church_id' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const church = await this.churchesService.findOne({ church_id: id });
    return {
      status: true,
      data: church
    };
  }

  @Patch(':id')
  @UpdateCatalog('CHURCHES')
  @TransformResponse()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateChurchDto: Prisma.churchesUpdateInput,
  ) {
    return this.churchesService.update({ church_id: id }, updateChurchDto);
  }

  @Delete(':id')
  @DeleteCatalog('CHURCHES')
  @TransformResponse()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.churchesService.remove({ church_id: id });
  }
}
