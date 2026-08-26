import { IsEnum, IsNumber, Max, Min } from "class-validator";

export class UpdateTimesheetDTO {
    @IsEnum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"])
    day!: string

    @IsNumber()
    @Min(0)
    @Max(24)
    value: number = 0
}