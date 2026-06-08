import { IsEmail, IsEnum, IsString, MaxLength, MinLength, ValidateNested } from "class-validator";
import { Role } from "../../generated/prisma/enums";
import { Type } from "class-transformer";

export class CreateUserDto {
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    fullname!: string;

    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(9)
    @MaxLength(20)
    phone!: string;

    @IsString()
    @MinLength(8)
    @MaxLength(20)
    password!: string;

    @IsString()
    @MinLength(8)
    @MaxLength(20)
    confirmPassword!: string;

    @IsEnum(Role, { each: true })
    roles!: Role[]
}

