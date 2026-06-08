import { IsEmail, IsEnum, IsString, MaxLength, MinLength, ValidateIf } from "class-validator";
import { ClientType, EnterpriseLegalForm } from "../../generated/prisma/enums";

export class CreateClientDTO {
    @IsEnum(ClientType)
    type!: ClientType

    @IsString()
    @MinLength(4)
    @MaxLength(20)
    country!: string

    @IsString()
    @MinLength(4)
    @MaxLength(40)
    address!: string

    @IsString()
    @MinLength(4)
    @MaxLength(40)
    contactName!: string

    @IsString()
    @MinLength(9)
    @MaxLength(20)
    phone!: string

    @IsEmail()
    email!: string

    @ValidateIf(o => o.type === ClientType.ENTREPRISE)
    @IsString()
    @MinLength(3)
    @MaxLength(40)
    enterpriseName?: string

    @ValidateIf(o => o.type === ClientType.ENTREPRISE)
    @IsEnum(EnterpriseLegalForm)
    enterpriseLegalForm?: EnterpriseLegalForm

    @IsString()
    @MinLength(3)
    @MaxLength(40)
    mainActivity?: string
}