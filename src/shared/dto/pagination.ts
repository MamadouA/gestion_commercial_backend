import { IsInt, IsOptional, Min } from "class-validator";

export class PaginationDTO {
    @IsInt()
    @Min(1)
    @IsOptional()
    currentPage: number = 1;

    @IsInt()
    @Min(10)
    @IsOptional()
    pageSize: number = 10;
}