import { Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UsersController } from '../../../common/decorators/users-controller.decorator';
import { CreateDataUser, ReadDataUser, UpdateDataUser, DeleteDataUser } from '../../../common/decorators/users-endpoint.decorator';
import { TransformResponse } from '../../../common/decorators/transform-response.decorator';
import { UsersAllergies } from './users-allergies.model';
import { UsersAllergiesService } from './users-allergies.service';

@UsersController('allergies')
export class UsersAllergiesController {
  constructor(private readonly usersAllergiesService: UsersAllergiesService) {}

  @Post()
  @CreateDataUser('USERS_ALLERGIES')
  @TransformResponse()
  create(@Body() createUserAllergyDto: Prisma.users_allergiesCreateInput) {
    return this.usersAllergiesService.create(createUserAllergyDto);
  }

  @Post('many')
  @CreateDataUser('USERS_ALLERGIES')
  @TransformResponse()
  createMany(@Body() createUserAllergyDto: Prisma.users_allergiesUncheckedCreateInput[]) {
    return this.usersAllergiesService.createMany(createUserAllergyDto);
  }

  @Post('assign-allergies')
  @CreateDataUser('USERS_ALLERGIES')
  @TransformResponse()
  assignAllergiesToUser(
    @Body('userId') userId: string,
    @Body('allergyIds') allergyIds: number[]
  ) {
    return this.usersAllergiesService.assignAllergiesToUser(userId, allergyIds);
  }

  @Get()
  @ReadDataUser('USERS_ALLERGIES')
  @TransformResponse({ idField: 'user_allergies_id' })
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
    @Query('where') where?: string,
    @Query('orderBy') orderBy?: string
  ): Promise<{ status: boolean, data: UsersAllergies[], total: number }> {
    return await this.usersAllergiesService.findAll({
      skip: +skip || 0,
      take: +take || 10,
      cursor: cursor ? { user_allergies_id: +cursor } : undefined,
      where: where ? JSON.parse(where) : undefined,
      orderBy: orderBy ? JSON.parse(orderBy) : undefined,
    });
  }

  @Get(':id')
  @ReadDataUser('USERS_ALLERGIES')
  @TransformResponse({ idField: 'user_allergies_id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersAllergiesService.findOne(id);
  }

  @Get('by-user/:userId')
  @ReadDataUser('USERS_ALLERGIES')
  @TransformResponse({ idField: 'user_allergies_id' })
  findByUser(@Param('userId') userId: string) {
    return this.usersAllergiesService.findByUserId(userId);
  }

  @Get('by-allergy/:allergyId')
  @ReadDataUser('USERS_ALLERGIES')
  @TransformResponse({ idField: 'user_allergies_id' })
  findByAllergy(@Param('allergyId', ParseIntPipe) allergyId: number) {
    return this.usersAllergiesService.findByAllergyId(allergyId);
  }

  @Patch(':id')
  @UpdateDataUser('USERS_ALLERGIES')
  @TransformResponse()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserAllergyDto: Prisma.users_allergiesUpdateInput
  ) {
    return this.usersAllergiesService.update(id, updateUserAllergyDto);
  }

  @Delete(':id')
  @DeleteDataUser('USERS_ALLERGIES')
  @TransformResponse()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersAllergiesService.softDelete(id);
  }

  @Delete('by-user/:userId')
  @DeleteDataUser('USERS_ALLERGIES')
  @TransformResponse()
  removeByUser(@Param('userId') userId: string) {
    return this.usersAllergiesService.removeByUserId(userId);
  }

  @Delete('by-user-allergy/:userId/:allergyId')
  @DeleteDataUser('USERS_ALLERGIES')
  @TransformResponse()
  removeByUserAndAllergy(
    @Param('userId') userId: string,
    @Param('allergyId', ParseIntPipe) allergyId: number
  ) {
    return this.usersAllergiesService.removeByUserAndAllergy(userId, allergyId);
  }
} 