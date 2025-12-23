import { Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CatalogController } from '../../../common/decorators/catalog-controller.decorator';
import { ReadCatalog, CreateCatalog, UpdateCatalog, DeleteCatalog } from '../../../common/decorators/catalog-endpoint.decorator';
import { TransformResponse } from '../../../common/decorators/transform-response.decorator';
import { MasterHonorsService } from './master-honors.service';

@CatalogController('master-honors')
export class MasterHonorsController {
  constructor(private readonly masterHonorsService: MasterHonorsService) {}

  @Post()
  @CreateCatalog('MASTER_HONORS')
  @TransformResponse()
  create(@Body() createMasterHonorDto: Prisma.master_honorsCreateInput) {
    return this.masterHonorsService.create(createMasterHonorDto);
  }

  @Post('many')
  @CreateCatalog('MASTER_HONORS')
  @TransformResponse()
  createMany(@Body() createMasterHonorDto: Prisma.master_honorsCreateManyInput[]) {
    return this.masterHonorsService.createMany(createMasterHonorDto);
  }

  @Get()
  @ReadCatalog('MASTER_HONORS')
  @TransformResponse({ idField: 'master_honor_id' })
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
    @Query('where') where?: string,
    @Query('orderBy') orderBy?: string
  ) {
    return await this.masterHonorsService.findAll({
      skip: +skip || 0,
      take: +take || 100,
      cursor: cursor ? { master_honor_id: +cursor } : undefined,
      where: where ? JSON.parse(where) : undefined,
      orderBy: orderBy ? JSON.parse(orderBy) : undefined,
    });
  }

  @Get(':id')
  @ReadCatalog('MASTER_HONORS')
  @TransformResponse({ idField: 'master_honor_id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.masterHonorsService.findOne(+id);
  }

  @Get('search')
  @ReadCatalog('MASTER_HONORS')
  @TransformResponse({ idField: 'master_honor_id' })
  search(@Query('term') term: string) {
    return this.masterHonorsService.search(term);
  }

  @Patch(':id')
  @UpdateCatalog('MASTER_HONORS')
  @TransformResponse()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMasterHonorDto: Prisma.master_honorsUpdateInput
  ) {
    return this.masterHonorsService.update(id, updateMasterHonorDto);
  }

  @Delete(':id')
  @DeleteCatalog('MASTER_HONORS')
  @TransformResponse()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.masterHonorsService.softDelete(id);
  }
} 