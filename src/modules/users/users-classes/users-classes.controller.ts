import { Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, ParseUUIDPipe } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UsersController } from '../../../common/decorators/users-controller.decorator';
import { CreateDataUser, ReadDataUser, UpdateDataUser, DeleteDataUser } from '../../../common/decorators/users-endpoint.decorator';
import { TransformResponse } from '../../../common/decorators/transform-response.decorator';
import { UsersClasses } from './users-classes.model';
import { UsersClassesService } from './users-classes.service';

@UsersController('users-classes')
export class UsersClassesController {
  constructor(private readonly usersClassesService: UsersClassesService) {}

  @Post('add')
  @CreateDataUser('USERS_CLASSES')
  @TransformResponse()
  async create(@Body() createUserClassDto: Prisma.users_classesUncheckedCreateInput) {
    return this.usersClassesService.create(createUserClassDto);
  }

  @Get()
  @ReadDataUser('USERS_CLASSES')
  @TransformResponse({ idField: 'user_class_id' })
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
    @Query('where') where?: string,
    @Query('orderBy') orderBy?: string
  ): Promise<{ status: boolean, data: UsersClasses[], total: number, nextCursor?: number }> {
    return await this.usersClassesService.findAll({
        skip: +skip || 0,
        take: +take || 20,
        cursor: cursor ? { user_class_id: +cursor } : undefined,
        where: where ? JSON.parse(where) : undefined,
        orderBy: orderBy ? JSON.parse(orderBy) : undefined,
      });
  }

  @Get(':id')
  @ReadDataUser('USERS_CLASSES')
  @TransformResponse({ idField: 'user_class_id' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersClassesService.findOne(id);
  }

  @Get('by-user/:userId')
  @ReadDataUser('USERS_CLASSES')
  @TransformResponse({ idField: 'user_class_id' })
  async findByUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.usersClassesService.findByUser(userId);
  }

  @Get('by-class/:classId')
  @ReadDataUser('USERS_CLASSES')
  @TransformResponse({ idField: 'user_class_id' })
  findByClass(@Param('classId', ParseIntPipe) classId: number) {
    return this.usersClassesService.findByClass(classId);
  }

  @Patch(':id')
  @UpdateDataUser('USERS_CLASSES')
  @TransformResponse()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserClassDto: Prisma.users_classesUpdateInput
  ) {
    return this.usersClassesService.update(id, updateUserClassDto);
  }

  @Delete(':id')
  @DeleteDataUser('USERS_CLASSES')
  @TransformResponse()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersClassesService.softDelete(id);
  }
} 