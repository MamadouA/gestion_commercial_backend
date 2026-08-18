import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { RoleManagementService } from './role-management.service';
import { CurrentUser } from '../shared/current-user.decoration';
import { Role, Tenant } from '../generated/prisma/client';
import { PermissionQueryDTO } from './dto/permission-query.dto';
import { CurrentUserType } from '../auth/auth.types';
import { RoleQueryDTO } from './dto/role-query.dto';

@Controller('role-management')
export class RoleManagementController {
    constructor(private readonly roleManagementService: RoleManagementService) {}

    // -
    @Get('roles/all')
    async findAllRoles(@Query() query: RoleQueryDTO, @CurrentUser() user: CurrentUserType) {
        return await this.roleManagementService.findAllRoles(query, user);
    }

    @Get('permissions/all')
    async findAllPermissions(@Query() query: PermissionQueryDTO, @CurrentUser('tenant') tenant: Tenant) {
        return await this.roleManagementService.findAllPermissions(query, tenant.name);
    }

    @Post('roles/create')
    async createRole(@Body() createRoleDTO: any, @CurrentUser() user: CurrentUserType) {
        return await this.roleManagementService.createRole(createRoleDTO, user);
    }
}
