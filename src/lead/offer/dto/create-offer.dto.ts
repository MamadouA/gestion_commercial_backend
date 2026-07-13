import { IsArray, IsDateString, IsIn, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min, MinLength, Validate, ValidateNested } from "class-validator"

export class CreateOfferDTO {
    @IsString()
    @MinLength(3)
    @MaxLength(255)
    title!: string

    @IsString()
    @MinLength(3)
    @IsOptional()
    description!: string

    @IsNumber()
    @Min(1)
    clientId!: number

    @IsDateString()
    @IsOptional()
    expiryDate!: string
    
    @IsNumber()
    @Min(1)
    amountExcludingTax!: number

    @IsNumber()
    @Min(1)
    vatAmout!: number
}