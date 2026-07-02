import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min, MinLength, Validate, ValidateNested } from "class-validator"
import { OfferStatus } from "../../../generated/prisma/enums"
import { CreateCommentDTO } from "../../../shared/dto/create.comment.dto"
import { Type } from "class-transformer"

export class UpdateOfferDTO {
    @IsString()
    @MinLength(3)
    @IsOptional()
    title?: string

    @IsEnum(OfferStatus)
    @IsOptional()
    status?: OfferStatus

    @IsString()
    @MinLength(3)
    @IsOptional()
    description?: string

    @IsNumber()
    @Min(1)
    @IsOptional()
    amountIncludingTax?: number

    @IsNumber()
    @Min(1)
    @IsOptional()
    amountExcludingTax?: number

    @IsNumber()
    @Min(1)
    @IsOptional()
    vatAmount?: number

    @IsDateString()
    @IsOptional()
    expiryDate?: string

    @Validate(IsNumber, { each: true })
    @IsOptional()
    memberIds?: number[]

    @Validate(IsNumber, { each: true })
    @IsOptional()
    productIds? : number[]

    @ValidateNested()
    @Type(() => CreateCommentDTO)
    @IsOptional()
    comment?: CreateCommentDTO
}