import { IsEnum, IsNumber, IsString, Min, MinLength } from "class-validator"

export class CreateDocumentDTO {
    @IsString()
    @MinLength(10)
    summary!: string

    @IsEnum(["PROJECT", "OFFER", "PROSPECTION", "INVOICE", "REPORT"])
    resourceType!: string

    @IsNumber()
    @Min(1)
    resourceId!: number
}