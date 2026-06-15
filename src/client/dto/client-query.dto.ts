import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator";
import { ClientType } from "../../generated/prisma/enums";
import { PaginationDTO } from "../../shared/dto/pagination";

export class ClientQueryDTO extends PaginationDTO {
    @IsEnum([ClientType.ENTREPRISE, ClientType.PARTICULIER, null, "", undefined] )
    @IsOptional()
    type!: ClientType

    @IsString()
    @IsOptional()
    enterpriseName!: string

    @IsOptional()
    @IsString()
    email!: string

    @IsString()
    @IsOptional()
    country!: string
}