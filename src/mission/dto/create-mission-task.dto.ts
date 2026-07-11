import { IsNumber, IsString, Min, MinLength } from "class-validator"

export class CreateMissionTaskDTO {
    @IsString()
    @MinLength(2)
    name!: string

    @IsNumber()
    @Min(0)
    unitPrice!: number
}