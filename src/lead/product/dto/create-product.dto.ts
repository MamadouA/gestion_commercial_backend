import { IsEnum, IsString, MaxLength, MinLength, validate } from "class-validator"
import { ProductDomain } from "../../../generated/prisma/enums"

export class CreateProductDTO {
    @IsEnum(ProductDomain)
    domain!: string

    @IsString()
    @MinLength(3)
    @MaxLength(255)
    title!: string
}