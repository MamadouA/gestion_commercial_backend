import { IsString, MinLength, ValidateNested } from "class-validator"
import { CreateMissionTaskDTO } from "./create-mission-task.dto"
import { Type } from "class-transformer"

export class CreateMissionDTO {
    @IsString()
    @MinLength(2)
    code!: string

    @IsString()
    @MinLength(2)
    domain!: string

    @IsString()
    @MinLength(2)
    name!: string

    @ValidateNested({ each: true })
    @Type(() => CreateMissionTaskDTO)
    tasks!: CreateMissionTaskDTO[]
}