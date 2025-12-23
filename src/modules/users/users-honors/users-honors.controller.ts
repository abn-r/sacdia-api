import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UsersController } from '../../../common/decorators/users-controller.decorator';
import { CreateDataUser, ReadDataUser, UpdateDataUser, DeleteDataUser } from '../../../common/decorators/users-endpoint.decorator';
import { TransformResponse } from '../../../common/decorators/transform-response.decorator';
import { UsersHonorsService } from './users-honors.service';
import { CreateUserHonorDto, UpdateUserHonorDto, GroupedUserHonorsDto } from './users-honors.model';

@UsersController('users-honors')
export class UsersHonorsController {
  constructor(private readonly usersHonorsService: UsersHonorsService) {}

  @Post()
  @CreateDataUser('USER_HONORS')
  @TransformResponse()
  create(@Body() createUserHonorDto: CreateUserHonorDto) {
    return this.usersHonorsService.create(createUserHonorDto);
  }

  @Get()
  @ReadDataUser('USER_HONORS')
  @TransformResponse({ idField: 'user_honor_id' })
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
    @Query('where') where?: string,
    @Query('orderBy') orderBy?: string,
  ) {
    const params: {
      skip?: number;
      take?: number;
      cursor?: Prisma.users_honorsWhereUniqueInput;
      where?: Prisma.users_honorsWhereInput;
      orderBy?: Prisma.users_honorsOrderByWithRelationInput;
    } = {
      skip: skip ? +skip : undefined,
      take: take ? +take : undefined,
      cursor: cursor ? { user_honor_id: +cursor } : undefined, // Asumiendo cursor por user_honor_id
      where: where ? JSON.parse(where) : undefined,
      orderBy: orderBy ? JSON.parse(orderBy) : undefined,
    };
    return this.usersHonorsService.findAll(params);
  }

  @Get(':userId/by-category')
  @ReadDataUser('USER_HONORS')
  @TransformResponse()
  findUserHonorsGroupedByCategory(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.usersHonorsService.findUserHonorsGroupedByCategory(userId);
  }

  @Get(':id')
  @ReadDataUser('USER_HONORS')
  @TransformResponse({ idField: 'user_honor_id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersHonorsService.findOne(id);
  }

  @Patch(':id')
  @UpdateDataUser('USER_HONORS')
  @TransformResponse()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserHonorDto: UpdateUserHonorDto,
  ) {
    return this.usersHonorsService.update(id, updateUserHonorDto);
  }

  @Delete(':id')
  @DeleteDataUser('USER_HONORS')
  @TransformResponse()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersHonorsService.remove(id);
  }
} 