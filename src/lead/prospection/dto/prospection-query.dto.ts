import { IsDateString, IsEnum, IsInt, IsOptional, IsString } from "class-validator"
import { ProspectionStatus } from "../../../generated/prisma/enums"
import { PaginationDTO } from "../../../shared/dto/pagination"

export class ProspectionQueryDTO extends PaginationDTO {
    @IsString()
    @IsOptional()
    proposedService?: string 

    @IsDateString()
    @IsOptional()
    startDate?: Date

    @IsDateString()
    @IsOptional()
    endDate?: Date

    @IsEnum(ProspectionStatus)
    @IsOptional()
    status?: ProspectionStatus
}