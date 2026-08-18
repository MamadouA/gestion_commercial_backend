import { IsOptional, IsString } from "class-validator"

export class SubscriptionQueryDTO {
    @IsString()
    @IsOptional()
    name?: string
}