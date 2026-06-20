import { IsDateString, IsEnum, IsInt, IsString, MinLength, Validate } from "class-validator";
import { ProspectionStatus } from "../../../generated/prisma/enums";
import { Transform, Type } from "class-transformer";

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