import { IsEnum, IsNumber, IsString, Min, MinLength } from "class-validator";
import { Feature } from "../../generated/prisma/enums";
export class CreateSubscriptionDTO {
    @IsString()
    @MinLength(3)
    name!: string

    @IsNumber()
    @Min(5)
    maxUserCount!: number

    @IsNumber()
    @Min(20)
    storage!: number

    @IsNumber()
    @Min(10000)
    price!: number

    @IsEnum(Feature, { each: true })
    features!: Feature[]
}