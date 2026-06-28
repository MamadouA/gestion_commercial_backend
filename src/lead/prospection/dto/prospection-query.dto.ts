import { IsDateString, IsEnum, IsInt, IsOptional, IsString } from "class-validator"
import { ProspectionStatus } from "../../../generated/prisma/enums"
import { PaginationDTO } from "../../../shared/dto/pagination"

export class ProspectionQueryDTO extends PaginationDTO {
    @IsString()
    @IsOptional()
    authorName?: string 

    @IsDateString()
    @IsOptional()
    startDate?: string

    @IsDateString()
    @IsOptional()
    endDate?: string

    @IsString()
    @IsOptional()
    contactNameOrEnterpriseName?: string
    
    @IsEnum(ProspectionStatus)
    @IsOptional()
    status?: ProspectionStatus
}