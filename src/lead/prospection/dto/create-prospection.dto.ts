import { IsDateString, IsEnum, IsInt, IsOptional, IsString, MinLength, Validate } from "class-validator";
import { AttachementSummaryDTO } from "../../../document/dto/create-document.dto";

export class CreateProspectionDTO {
    @IsString()
    @MinLength(3)
    service!: string;

    @IsDateString()
    deadline!: string;

    @IsInt()
    clientId!: number;
    
    @Validate(AttachementSummaryDTO)
    @IsOptional()
    attachement!: AttachementSummaryDTO
}