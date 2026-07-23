import { IsEnum, IsNumber, IsOptional, IsString, Min, MinLength } from "class-validator"
import { ProjectStatus } from "../../generated/prisma/enums"

export class UpdateProjectDTO {
    @IsString()
    @IsOptional()
    @MinLength(3)
    journalEvent!: string

    @IsString()
    @IsOptional()
    @MinLength(3)
    invoiceDescription!: string

    @IsNumber()
    @IsOptional()
    @Min(0)
    invoiceAmount!: number

    @IsEnum(ProjectStatus)
    @IsOptional()
    status!: keyof typeof ProjectStatus
}