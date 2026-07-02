import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator"
import { Role } from "../../generated/prisma/enums"
import { PaginationDTO } from "../../shared/dto/pagination"
import { Transform } from "class-transformer"

export class UserQueryDTO extends PaginationDTO {
    @IsString()
    @IsOptional()
    email!: string

    @IsString()
    @IsOptional()
    fullname!: string

    @Transform(({ value }) => value === "" ? undefined : value)
    @IsEnum(Role)
    @IsOptional()
    role!: Role
}