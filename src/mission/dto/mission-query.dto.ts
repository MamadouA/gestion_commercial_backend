import { PaginationDTO } from "../../shared/dto/pagination";

export class MissionQueryDTO extends PaginationDTO {
    code?: string
    domain?: string
    name?: string
}