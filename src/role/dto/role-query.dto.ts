import { IsOptional, IsString } from "class-validator"
import { PaginationDTO } from "../../shared/dto/pagination"

export class RoleQueryDTO extends PaginationDTO{
    @IsString()
    @IsOptional()
    name?: string

    @IsString()
    @IsOptional()
    description?: string
}