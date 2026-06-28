import { Type } from "class-transformer";
import { CreateUserDTO } from "../../user/dto/create-user.dto";
import { IsBoolean, isBoolean, IsDateString, IsDefined, IsEmail, IsEnum, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';
import { Role } from "../../generated/prisma/enums";

class TenantOwnerDTO extends CreateUserDTO{

    @IsString()
    @MinLength(8)
    @MaxLength(20)
    password!: string;

    @IsString()
    @MinLength(8)
    @MaxLength(20)
    confirmPassword!: string;
}

export class CreateTenantDTO {
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    name!: string;

    @ValidateNested()
    @Type(() => TenantOwnerDTO)
    @IsDefined()
    user!: TenantOwnerDTO;
}

