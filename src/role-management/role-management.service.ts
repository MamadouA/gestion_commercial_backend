import { Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaClientService } from '../database/prisma-client.service';
import { PermissionWhereInput, RoleWhereInput } from '../generated/prisma/models';
import { PermissionQueryDTO } from './dto/permission-query.dto';
import { CreateRoleDTO } from './dto/create-role.dto';
import { CurrentUserType } from '../auth/auth.types';
import { RoleQueryDTO } from './dto/role-query.dto';

@Injectable()
export class RoleManagementService {
    private logger = new Logger(RoleManagementService.name);
    constructor(private readonly prismaClientService: PrismaClientService) {}

    // -
    async createRole(createRoleDTO: CreateRoleDTO, user: CurrentUserType) {
        try {
            if(user.role.name !== 'SUPERADMIN' && user.role.name !== 'ADMIN') {
                throw new UnauthorizedException('You are not authorized to create a role.');
            }

            if(user.role.name === "ADMIN") {
                if(createRoleDTO.name === "SUPERADMIN") {
                    throw new UnauthorizedException('You are not authorized to create a SUPERADMIN role.');
                }
            }

            return await this.prismaClientService.role.create({
                data: {
                    name: createRoleDTO.name,
                    description: createRoleDTO.description,
                    permissions: {
                        connect: createRoleDTO.permissionIds.map(id => ({ id }))
                    },
                    tenant: {
                        connect: {
                            id: user.tenantId
                        }
                    }
                },
                select: {
                    name: true,
                    description: true,
                    permissions: {
                        select: {
                            name: true,
                            description: true,
                        }
                    }
                }
            });
        }
        catch(err) {
            this.logger.error("Error while creating the role: ", err);
            throw new InternalServerErrorException("Error while creating the role.");
        }
    }

    // - currentUserRole is the role of the logged in user
    async findAllRoles(query: RoleQueryDTO, user: CurrentUserType) {
        const filter: RoleWhereInput = {
            tenantId: user.tenantId
        };

        try{
            if(user.role.name !== 'SUPERADMIN') { // the superadmin role is only visible to the superadmin
                filter.name = {
                    not: 'SUPERADMIN'
                }
            }

            if(query.name) {
                filter.name = {
                    contains: query.name,
                    mode: 'insensitive'
                }
            }

            if(query.description) {
                filter.description = {
                    contains: query.description,
                    mode: 'insensitive'
                }
            }

            return await this.prismaClientService.role.findMany({
                where: filter,
                select: {
                    id: true,
                    name: true,
                    description: true,
                    permissions: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                        }
                    }
                },
                orderBy: {
                    id: 'desc'
                },
                skip: (query.currentPage - 1) * query.pageSize,
                take: query.pageSize,
            });
        }
        catch(err) {
            this.logger.error("Error while fetching the roles: ", err);
            throw new InternalServerErrorException("Error while fetching the roles.");
        }
    }

    // -
    async findAllPermissions (query: PermissionQueryDTO, roleName: string) {
        const filter: PermissionWhereInput = {
            description: {
                contains: query.description,
                mode: 'insensitive'
            }
        }

        if(roleName !== 'SUPERADMIN') { 
            filter.name = {
                not: 'tenant.manage'
            }
        }

        try {
            return await this.prismaClientService.permission.findMany({
                where: filter,
                orderBy: {
                    id: 'asc'
                },
                skip: (query.currentPage - 1) * query.pageSize,
                take: query.pageSize
            });
        }
        catch(err) {
            this.logger.error("Error while fetching the permissions: ", err);
            throw new InternalServerErrorException("Error while fetching the permissions.");
        }
    }
}
