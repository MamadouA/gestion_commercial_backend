import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator"
import { PaginationDTO } from "../../shared/dto/pagination"
import { Transform } from "class-transformer"
import { Role } from "../../generated/prisma/client"

export class UserQueryDTO extends PaginationDTO {
    @IsString()
    @IsOptional()
    email!: string

    @IsString()
    @IsOptional()
    fullname!: string

    @IsOptional()
    roleName!: string
}