import { IsEnum, IsOptional, IsString } from "class-validator"
import { PaginationDTO } from "../../shared/dto/pagination"
import { InvoiceStatus } from "../../generated/prisma/enums"
import { Transform } from "class-transformer"

export class InvoiceQueryDTO extends PaginationDTO {
    @IsString()
    @IsOptional()
    description!: string

    @IsString()
    @IsOptional()
    createdAt!: string

    @Transform(({ value }) => value === "" ? undefined : value)
    @IsEnum(InvoiceStatus)
    @IsOptional()
    status?: InvoiceStatus
}