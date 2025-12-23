import { Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ClassesController as ClassesControllerDecorator } from '../../common/decorators/classes-controller.decorator';
import { ReadClasses, CreateClasses, UpdateClasses, DeleteClasses } from '../../common/decorators/classes-endpoint.decorator';
import { TransformClassesResponse } from '../../common/decorators/transform-classes-response.decorator';
import { Classes } from './classes.model';
import { ClassesService } from './classes.service';

@ClassesControllerDecorator('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @CreateClasses()
  @TransformClassesResponse()
  create(@Body() createClassDto: Prisma.classesCreateInput) {
    return this.classesService.create(createClassDto);
  }

  @Get()
  @ReadClasses()
  @TransformClassesResponse({ idField: 'class_id' })
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
    @Query('where') where?: string,
    @Query('orderBy') orderBy?: string
  ){
    return await this.classesService.findAll({
      skip: +skip || 0,
      take: +take || 100,
      cursor: cursor ? { class_id: +cursor } : undefined,
      where: where ? JSON.parse(where) : undefined,
      orderBy: orderBy ? JSON.parse(orderBy) : undefined,
    });
  }

  @Get(':id')
  @ReadClasses()
  @TransformClassesResponse({ idField: 'class_id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.classesService.findOne(+id);
  }

  @Patch(':id')
  @UpdateClasses()
  @TransformClassesResponse()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClassDto: Prisma.classesUpdateInput
  ) {
    return this.classesService.update(id, updateClassDto);
  }

  @Delete(':id')
  @DeleteClasses()
  @TransformClassesResponse()
  remove(
    @Param('id', ParseIntPipe) id: number,
    //@Query('soft') soft?: boolean
  ) {
    // return soft
    //   ? this.classesService.softDelete(id)
    //   : this.classesService.remove(id);
    return this.classesService.softDelete(id);
  }
}

