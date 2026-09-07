import { IsEnum, IsNumber, IsString, MaxLength, Min, MinLength } from "class-validator"

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


export class AttachementSummaryDTO {
    @IsString()
    @MinLength(10)
    @MaxLength(255)
    summary!: string
}