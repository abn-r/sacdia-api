import { Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CatalogController } from '../../../common/decorators/catalog-controller.decorator';
import { ReadCatalog, CreateCatalog, UpdateCatalog, DeleteCatalog } from '../../../common/decorators/catalog-endpoint.decorator';
import { TransformResponse } from '../../../common/decorators/transform-response.decorator';
import { RelationshipTypeService } from './relationshipType.service';

@CatalogController('relationship_types')
export class RelationshipTypeController {
  constructor(private readonly relationshipTypeService: RelationshipTypeService) {}

  @Post()
  @CreateCatalog('relationship_types')
  @TransformResponse()
  create(@Body() createRelationshipDto: Prisma.relationship_typeCreateInput) {
    return this.relationshipTypeService.create(createRelationshipDto);
  }

  @Post('many')
  @CreateCatalog('relationship_types')
  @TransformResponse()
  createMany(@Body() createRelationshipDto: Prisma.relationship_typeCreateInput[]) {
    return this.relationshipTypeService.createMany(createRelationshipDto);
  }

  @Get()
  @ReadCatalog('relationship_types')
  @TransformResponse({ idField: 'relationship_type_id' })
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
    @Query('where') where?: string,
    @Query('orderBy') orderBy?: string
  ): Promise<{ status: boolean, data: any[], total: number, nextCursor?: number | string }> {
    return await this.relationshipTypeService.findAll({
      skip: +skip || 0,
      take: +take || 100,
      cursor: cursor ? { relationship_type_id: +cursor } : undefined,
      where: where ? JSON.parse(where) : undefined,
      orderBy: orderBy ? JSON.parse(orderBy) : undefined,
    });
  }

  @Get(':id')
  @ReadCatalog('relationship_types')
  @TransformResponse({ idField: 'relationship_type_id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.relationshipTypeService.findOne(+id);
  }

  @Get('search')
  @ReadCatalog('relationship_types')
  @TransformResponse({ idField: 'relationship_type_id' })
  search(@Query('term') term: string) {
    return this.relationshipTypeService.search(term);
  }

  @Patch(':id')
  @UpdateCatalog('relationship_types')
  @TransformResponse()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRelationshipDto: Prisma.relationship_typeUpdateInput
  ) {
    return this.relationshipTypeService.update(id, updateRelationshipDto);
  }

  @Delete(':id')
  @DeleteCatalog('relationship_types')
  @TransformResponse()
  remove(
    @Param('id', ParseIntPipe) id: number,
    //@Query('soft') soft?: boolean
  ) {
    // return soft
    //   ? this.RelationshipTypeService.softDelete(id)
    //   : this.RelationshipTypeService.remove(id);
    return this.relationshipTypeService.softDelete(id);
  }
}
