import { Type } from "class-transformer";
import { IsInt, IsOptional, Min } from "class-validator";

export class PaginationDTO {
    @IsInt()
    @Min(1)
    @IsOptional()
    currentPage!: number;

    @IsInt()
    @Min(10)
    @IsOptional()
    pageSize!: number;
}