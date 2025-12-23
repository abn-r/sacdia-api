import { Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ClubTypesService } from './club_types.service';
import { CatalogController } from '../../../common/decorators/catalog-controller.decorator';
import { ReadCatalog, CreateCatalog, UpdateCatalog, DeleteCatalog } from '../../../common/decorators/catalog-endpoint.decorator';
import { TransformResponse } from '../../../common/decorators/transform-response.decorator';
import { ClubTypes } from './club_types.model';

@CatalogController('club-types')
export class ClubTypesController {
  constructor(private readonly clubTypesService: ClubTypesService) {}

  @Post()
  @CreateCatalog('CLUB_TYPES')
  @TransformResponse()
  create(@Body() createClubTypeDto: Prisma.club_typesCreateInput) {
    return this.clubTypesService.create(createClubTypeDto);
  }

  @Post('many')
  @CreateCatalog('CLUB_TYPES')
  @TransformResponse()
  createMany(@Body() createClubTypeDto: Prisma.club_typesCreateInput[]) {
    return this.clubTypesService.createMany(createClubTypeDto);
  }

  @Get()
  @ReadCatalog('CLUB_TYPES')
  @TransformResponse({ idField: 'ct_id' })
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
    @Query('where') where?: string,
    @Query('orderBy') orderBy?: string
  ): Promise<{ status: boolean, data: ClubTypes[], total: number }> {
    return await this.clubTypesService.findAll({
      skip: +skip || 0,
      take: +take || 10,
      cursor: cursor ? { ct_id: +cursor } : undefined,
      where: where ? JSON.parse(where) : undefined,
      orderBy: orderBy ? JSON.parse(orderBy) : undefined,
    });
  }

  @Get(':id')
  @ReadCatalog('CLUB_TYPES')
  @TransformResponse({ idField: 'ct_id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clubTypesService.findOne(+id);
  }

  @Get('search')
  @ReadCatalog('CLUB_TYPES')
  @TransformResponse({ idField: 'ct_id' })
  search(@Query('term') term: string) {
    return this.clubTypesService.search(term);
  }

  @Patch(':id')
  @UpdateCatalog('CLUB_TYPES')
  @TransformResponse()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClubTypeDto: Prisma.club_typesUpdateInput
  ) {
    return this.clubTypesService.update(id, updateClubTypeDto);
  }

  @Delete(':id')
  @DeleteCatalog('CLUB_TYPES')
  @TransformResponse()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clubTypesService.softDelete(id);
  }
}

