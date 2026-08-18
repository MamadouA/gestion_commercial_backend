import { IsString } from "class-validator";
import { PaginationDTO } from "../../shared/dto/pagination";

export class PermissionQueryDTO extends PaginationDTO {
    @IsString()
    description?: string
}