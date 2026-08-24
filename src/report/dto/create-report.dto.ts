import { IsString, MaxLength, MinLength } from "class-validator";

export class CreateReportDTO {
    @IsString()
    @MinLength(10)
    @MaxLength(255)
    description!: string
}