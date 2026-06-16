import { IsDateString, IsEnum, IsInt, IsString, MinLength } from "class-validator";
import { ProspectionStatus } from "../../../generated/prisma/enums";

export class CreateProspectionDTO {
    @IsString()
    @MinLength(3)
    prosposedService!: string;

    @IsDateString()
    startDate!: string;

    @IsDateString()
    endDate!: string;

    @IsInt()
    clientIid!: number;
}