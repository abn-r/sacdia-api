import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CatalogController } from '../../../common/decorators/catalog-controller.decorator';
import { ReadCatalog, CreateCatalog, UpdateCatalog, DeleteCatalog } from '../../../common/decorators/catalog-endpoint.decorator';
import { TransformResponse } from '../../../common/decorators/transform-response.decorator';
import { Permissions as PermissionsModel } from './permissions.model';
import { PermissionsService } from './permissions.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/rbac.decorators';
import {
  CREATE_PERMISSIONS,
  DELETE_PERMISSIONS,
  READ_PERMISSIONS,
  UPDATE_PERMISSIONS,
  ASSIGN_PERMISSIONS_TO_ROLES
} from '../../../common/constants/permissions';
import { AssignPermissionsToRolesDto } from './models/assign-permissions-to-roles.dto';

@ApiTags('Permissions Catalog')
@ApiBearerAuth()
@UseGuards(PermissionsGuard)
@Controller('catalogs/permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @Permissions(CREATE_PERMISSIONS)
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({ status: 201, description: 'The permission has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @CreateCatalog('PERMISSIONS')
  @TransformResponse()
  async create(@Body() createPermissionDto: Prisma.permissionsCreateInput) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Post('many')
  @CreateCatalog('PERMISSIONS')
  @TransformResponse()
  createMany(@Body() createPermissionDto: Prisma.permissionsCreateInput[]) {
    return this.permissionsService.createMany(createPermissionDto);
  }

  @Get()
  @Permissions(READ_PERMISSIONS)
  @ApiOperation({ summary: 'Retrieve all permissions with pagination' })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Number of records to skip' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Number of records to take' })
  @ApiQuery({ name: 'cursor', required: false, type: String, description: 'Cursor for pagination' })
  @ApiQuery({ name: 'filter', required: false, type: String, description: 'JSON string for filtering' })
  @ApiQuery({ name: 'orderBy', required: false, type: String, description: 'JSON string for ordering' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved permissions.', type: [PermissionsModel] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('cursor') cursor?: string,
    @Query('filter') filter?: string,
    @Query('orderBy') orderBy?: string,
  ) {
    const where = filter ? JSON.parse(filter) : undefined;
    const orderByObj = orderBy ? JSON.parse(orderBy) : undefined;
    const cursorObj = cursor ? { permission_id: cursor } : undefined;

    return this.permissionsService.findAll({
      skip: skip ? +skip : undefined,
      take: take ? +take : undefined,
      cursor: cursorObj,
      where,
      orderBy: orderByObj,
    });
  }

  @Get('names')
  @Permissions(READ_PERMISSIONS)
  @ApiOperation({ summary: 'Retrieve all active permission names' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved permission names.', type: [String] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getAllPermissionNames() {
    return this.permissionsService.getAllPermissionNames();
  }

  @Get(':id')
  @Permissions(READ_PERMISSIONS)
  @ApiOperation({ summary: 'Retrieve a single permission by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Permission UUID' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved permission.', type: PermissionsModel })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ReadCatalog('PERMISSIONS')
  @TransformResponse({ idField: 'permission_id' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.permissionsService.findOne(id);
  }

  @Get('search')
  @ReadCatalog('PERMISSIONS')
  @TransformResponse({ idField: 'permission_id' })
  search(@Query('term') term: string) {
    return this.permissionsService.search(term);
  }

  @Put(':id')
  @Permissions(UPDATE_PERMISSIONS)
  @ApiOperation({ summary: 'Update a permission by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Permission UUID' })
  @ApiResponse({ status: 200, description: 'Successfully updated permission.', type: PermissionsModel })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UpdateCatalog('PERMISSIONS')
  @TransformResponse()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePermissionDto: Prisma.permissionsUpdateInput
  ) {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @Permissions(DELETE_PERMISSIONS)
  @ApiOperation({ summary: 'Soft delete a permission by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Permission UUID' })
  @ApiResponse({ status: 200, description: 'Successfully deleted permission.' })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @DeleteCatalog('PERMISSIONS')
  @TransformResponse()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.permissionsService.softDelete(id);
  }

  @Post('assign-to-roles')
  @Permissions(ASSIGN_PERMISSIONS_TO_ROLES)
  @ApiOperation({ summary: 'Create/find permissions and assign them to multiple roles' })
  @ApiResponse({ status: 201, description: 'Permissions successfully assigned to roles.' })
  @ApiResponse({ status: 400, description: 'Bad Request (e.g., invalid input, roles not found).' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async assignPermissionsToRoles(@Body() assignPermissionsDto: AssignPermissionsToRolesDto) {
    return this.permissionsService.assignPermissionsToRoles(assignPermissionsDto);
  }
} 