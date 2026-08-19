import { IsEnum, IsNumber, IsString, Min, MinLength } from "class-validator"

export class CreateDocumentDTO {
    @IsString()
    @MinLength(10)
    description!: string

    @IsEnum(["PROJECT", "OFFER", "PROSPECTION", "INVOICE", "JOUNRAL"])
    resourceType!: string

    @IsNumber()
    @Min(1)
    resourceId!: number
}