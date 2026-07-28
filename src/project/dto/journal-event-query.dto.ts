import { IsDateString, IsOptional, IsString } from "class-validator"
import { PaginationDTO } from "../../shared/dto/pagination"

export class JournalEventQueryDTO extends PaginationDTO {
    @IsString()
    @IsOptional()
    event?: string

    @IsDateString()
    @IsOptional()
    createdAt?: string
}