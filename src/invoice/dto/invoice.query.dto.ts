import { IsOptional, IsString } from "class-validator"
import { PaginationDTO } from "../../shared/dto/pagination"

export class InvoiceQueryDTO extends PaginationDTO {
    @IsString()
    @IsOptional()
    description!: string

    @IsString()
    @IsOptional()
    createdAt!: string
}