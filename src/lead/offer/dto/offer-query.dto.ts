import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";
import { OfferStatus } from "../../../generated/prisma/enums";
import { PaginationDTO } from "../../../shared/dto/pagination";
import { Transform } from "class-transformer";

export class OfferQueryDTO extends PaginationDTO {
    @IsString()
    @IsOptional()
    companyName?: string

    @IsString()
    @IsOptional()
    contactName?: string
    
    @IsString()
    @IsOptional()
    authorName?: string

    @Transform(({ value }) => value === "" ? undefined : value)
    @IsEnum(OfferStatus)
    @IsOptional()
    status?: OfferStatus 

    @IsDateString()
    @IsOptional()
    deadline?: string
}