import { Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UsersController } from '../../../common/decorators/users-controller.decorator';
import { CreateDataUser, ReadDataUser, UpdateDataUser, DeleteDataUser } from '../../../common/decorators/users-endpoint.decorator';
import { TransformResponse } from '../../../common/decorators/transform-response.decorator';
import { UsersDiseases } from './users-diseases.model';
import { UsersDiseasesService } from './users-diseases.service';

@UsersController('diseases')
export class UsersDiseasesController {
  constructor(private readonly usersDiseasesService: UsersDiseasesService) {}

  @Post()
  @CreateDataUser('USERS_DISEASES')
  @TransformResponse()
  create(@Body() createUserDiseaseDto: Prisma.users_diseasesCreateInput) {
    return this.usersDiseasesService.create(createUserDiseaseDto);
  }

  @Post('many')
  @CreateDataUser('USERS_DISEASES')
  @TransformResponse()
  createMany(@Body() createUserDiseaseDto: Prisma.users_diseasesUncheckedCreateInput[]) {
    return this.usersDiseasesService.createMany(createUserDiseaseDto);
  }

  @Post('assign-diseases')
  @CreateDataUser('USERS_DISEASES')
  @TransformResponse()
  assignDiseasesToUser(
    @Body('userId') userId: string,
    @Body('diseaseIds') diseaseIds: number[]
  ) {
    return this.usersDiseasesService.assignDiseasesToUser(userId, diseaseIds);
  }

  @Get()
  @ReadDataUser('USERS_DISEASES')
  @TransformResponse({ idField: 'user_disease_id' })
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
    @Query('where') where?: string,
    @Query('orderBy') orderBy?: string
  ): Promise<{ status: boolean, data: UsersDiseases[], total: number }> {
    return await this.usersDiseasesService.findAll({
      skip: +skip || 0,
      take: +take || 10,
      cursor: cursor ? { user_disease_id: +cursor } : undefined,
      where: where ? JSON.parse(where) : undefined,
      orderBy: orderBy ? JSON.parse(orderBy) : undefined,
    });
  }

  @Get(':id')
  @ReadDataUser('USERS_DISEASES')
  @TransformResponse({ idField: 'user_disease_id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersDiseasesService.findOne(id);
  }

  @Get('by-user/:userId')
  @ReadDataUser('USERS_DISEASES')
  @TransformResponse({ idField: 'user_disease_id' })
  findByUser(@Param('userId') userId: string) {
    return this.usersDiseasesService.findByUserId(userId);
  }

  @Get('by-disease/:diseaseId')
  @ReadDataUser('USERS_DISEASES')
  @TransformResponse({ idField: 'user_disease_id' })
  findByDisease(@Param('diseaseId', ParseIntPipe) diseaseId: number) {
    return this.usersDiseasesService.findByDiseaseId(diseaseId);
  }

  @Patch(':id')
  @UpdateDataUser('USERS_DISEASES')
  @TransformResponse()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDiseaseDto: Prisma.users_diseasesUpdateInput
  ) {
    return this.usersDiseasesService.update(id, updateUserDiseaseDto);
  }

  @Delete(':id')
  @DeleteDataUser('USERS_DISEASES')
  @TransformResponse()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersDiseasesService.softDelete(id);
  }

  @Delete('by-user/:userId')
  @DeleteDataUser('USERS_DISEASES')
  @TransformResponse()
  removeByUser(@Param('userId') userId: string) {
    return this.usersDiseasesService.removeByUserId(userId);
  }

  @Delete('by-user-disease/:userId/:diseaseId')
  @DeleteDataUser('USERS_DISEASES')
  @TransformResponse()
  removeByUserAndDisease(
    @Param('userId') userId: string,
    @Param('diseaseId', ParseIntPipe) diseaseId: number
  ) {
    return this.usersDiseasesService.removeByUserAndDisease(userId, diseaseId);
  }
} 