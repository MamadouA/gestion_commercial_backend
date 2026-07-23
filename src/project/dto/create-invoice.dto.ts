import { IsEnum, IsNumber, IsString, Min, MinLength } from "class-validator"
import { InvoiceStatus } from "../../generated/prisma/enums"

export class CreateInvoiceDTO {
    @IsString()
    @MinLength(3)
    description!: string

    @IsNumber()
    @Min(0)
    amount!: number

    @IsEnum(InvoiceStatus)
    status!: InvoiceStatus
}