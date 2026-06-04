import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";
import { Tenant } from "../../generated/prisma/client";

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
    password!: string;

    @IsString()
    @MinLength(8)
    confirmPassword!: string;

}
