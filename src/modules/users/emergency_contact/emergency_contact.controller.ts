import {Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, ParseUUIDPipe} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { EmergencyContactService } from './emergency_contact.service';
import { TransformResponse } from '../../../common/decorators/transform-response.decorator';
import { UsersController } from '../../../common/decorators/users-controller.decorator';
import { CreateDataUser, ReadDataUser, UpdateDataUser, DeleteDataUser } from '../../../common/decorators/users-endpoint.decorator';

@UsersController('emergency-contacts')
export class EmergencyContactController {
  constructor(private readonly emergencyContactService: EmergencyContactService) {}

  @Post()
  @CreateDataUser('EMERGENCY_CONTACTS')
  @TransformResponse()
  create(@Body() createEmergencyContactDto: Prisma.emergency_contactsCreateInput) {
    return this.emergencyContactService.create(createEmergencyContactDto);
  }

  @Get()
  @ReadDataUser('EMERGENCY_CONTACTS')
  @TransformResponse({ idField: 'emergency_id' })
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
    @Query('where') where?: string,
    @Query('orderBy') orderBy?: string
  ) {
    return await this.emergencyContactService.findAll({
      skip: +skip || 0,
      take: +take || 10,
      cursor: cursor ? { emergency_id: +cursor } : undefined,
      where: where ? JSON.parse(where) : undefined,
      orderBy: orderBy ? JSON.parse(orderBy) : undefined,
    });
  }

  @Get('all')
  @ReadDataUser('EMERGENCY_CONTACTS')
  @TransformResponse({ idField: 'emergency_id' })
  async findAllByUser(@Query('userId', ParseUUIDPipe) userId: string) {
    return await this.emergencyContactService.findAllByUser(userId);
  }

  @Get(':id')
  @ReadDataUser('EMERGENCY_CONTACTS')
  @TransformResponse({ idField: 'emergency_id' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.emergencyContactService.findOne(id);
  }

  @Patch(':id')
  @UpdateDataUser('EMERGENCY_CONTACTS')
  @TransformResponse()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmergencyContactDto: Prisma.emergency_contactsUpdateInput
  ) {
    return this.emergencyContactService.update(id, updateEmergencyContactDto);
  }

  @Delete(':id')
  @DeleteDataUser('EMERGENCY_CONTACTS')
  @TransformResponse()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.emergencyContactService.softDelete(id);
  }
}
