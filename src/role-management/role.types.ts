import { Feature } from "../generated/prisma/enums";

export interface PermissionDTO {
    name: string;
    description: string;
    feature: Feature;
}

export interface CreateRoleDTO {
    name: string;
    description: string;
    feature: string;
    permissionIds: number[]
}