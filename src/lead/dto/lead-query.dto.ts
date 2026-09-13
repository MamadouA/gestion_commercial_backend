import { LeadStatus, LeadType } from "../../generated/prisma/enums"
import { PaginationDTO } from "../../shared/dto/pagination"

export class LeadQueryDTO extends PaginationDTO {
    service?: string
    type?: LeadType
    deadline?: Date
    status?: LeadStatus
    companyName?: string
    contactName?: string
}