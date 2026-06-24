import { IsDateString, IsEnum, IsInt, IsString, MinLength, Validate } from "class-validator";

export class CreateProspectionDTO {
    @IsString()
    @MinLength(3)
    prosposedService!: string;

    @IsDateString()
    startDate!: string;

    @IsDateString()
    endDate!: string;

    @IsInt()
    clientId!: number;
}