import { IsEmail, IsEnum, IsString, MaxLength, MinLength,  } from "class-validator";

export class CreateUserDTO {
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

    roleId!: number;
}

