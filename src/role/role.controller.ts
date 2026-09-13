import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../shared/current-user.decoration';
import { Role, Tenant } from '../generated/prisma/client';
import { PermissionQueryDTO } from './dto/permission-query.dto';
import { CurrentUserType } from '../auth/auth.types';
import { RoleQueryDTO } from './dto/role-query.dto';
import { RoleService } from './role.service';

@Controller('role-management')
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    // -
    @Get('roles/all')
    async findAllRoles(@Query() query: RoleQueryDTO, @CurrentUser() user: CurrentUserType) {
        return await this.roleService.findAllRoles(query, user);
    }

    @Get('permissions/all')
    async findAllPermissions(@Query() query: PermissionQueryDTO, @CurrentUser('role') role: Role) {
        return await this.roleService.findAllPermissions(query, role.name);
    }

    @Post('roles/create')
    async createRole(@Body() createRoleDTO: any, @CurrentUser() user: CurrentUserType) {
        return await this.roleService.createRole(createRoleDTO, user);
    }
}
