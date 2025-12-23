import { Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CatalogController } from '../../../common/decorators/catalog-controller.decorator';
import { ReadCatalog, CreateCatalog, UpdateCatalog, DeleteCatalog } from '../../../common/decorators/catalog-endpoint.decorator';
import { TransformResponse } from '../../../common/decorators/transform-response.decorator';
import { Roles } from './roles.model';
import { RolesService } from './roles.service';

@CatalogController('roles')
export class RolesController {
    constructor(private readonly rolesService: RolesService) {}

    @Post()
    @CreateCatalog('ROLES')
    @TransformResponse()
    create(@Body() createRoleDto: Prisma.rolesCreateInput) {
        return this.rolesService.create(createRoleDto);
    }

    @Post('many')
    @CreateCatalog('ROLES')
    @TransformResponse()
    createMany(@Body() createRoleDto: Prisma.rolesCreateInput[]) {
        return this.rolesService.createMany(createRoleDto);
    }

    @Get()
    @ReadCatalog('ROLES')
    @TransformResponse({ idField: 'role_id' })
    async findAll(
        @Query('skip') skip?: string,
        @Query('take') take?: string,
        @Query('cursor') cursor?: string,
        @Query('where') where?: string,
        @Query('orderBy') orderBy?: string
    ): Promise<{ status: boolean, data: Roles[], total: number }> {
        return await this.rolesService.findAll({
            skip: +skip || 0,
            take: +take || 10,
            cursor: cursor ? { role_id: cursor } : undefined,
            where: where ? JSON.parse(where) : undefined,
            orderBy: orderBy ? JSON.parse(orderBy) : undefined,
        });
    }

    @Get(':id')
    @ReadCatalog('ROLES')
    @TransformResponse({ idField: 'role_id' })
    findOne(@Param('id') id: string) {
        return this.rolesService.findOne(id);
    }

    @Get('search')
    @ReadCatalog('ROLES')
    @TransformResponse({ idField: 'role_id' })
    search(@Query('term') term: string) {
        return this.rolesService.search(term);
    }

    @Get('user-role')
    @ReadCatalog('ROLES')
    @TransformResponse()
    getUserRoleId() {
        return this.rolesService.findUserRole();
    }

    @Patch(':id')
    @UpdateCatalog('ROLES')
    @TransformResponse()
    update(
        @Param('id') id: string,
        @Body() updateRoleDto: Prisma.rolesUpdateInput
    ) {
        return this.rolesService.update(id, updateRoleDto);
    }

    @Delete(':id')
    @DeleteCatalog('ROLES')
    @TransformResponse()
    remove(@Param('id') id: string) {
        return this.rolesService.softDelete(id);
    }
} 