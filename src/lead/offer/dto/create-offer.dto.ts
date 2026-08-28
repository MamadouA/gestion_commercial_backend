import { IsDateString, IsNumber, IsOptional, IsString, MaxLength, Min, MinLength } from "class-validator"
import { CreateDocumentDTO } from "../../../document/dto/create-document.dto"

export class CreateOfferDTO {
    @IsString()
    @MinLength(3)
    @MaxLength(255)
    title!: string

    @IsNumber()
    @Min(1)
    clientId!: number

    @IsDateString()
    @IsOptional()
    expiryDate!: string
    
    @IsNumber()
    @Min(0)
    amountHT!: number

    @IsNumber()
    @Min(0)
    amountVAT!: number  

    document?: Pick<CreateDocumentDTO, "description">
}