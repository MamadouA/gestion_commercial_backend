import { Type } from "class-transformer";
import { IsArray, IsBoolean, isBoolean, IsDateString, IsDefined, IsEmail, IsEnum, IsNumber, IsString, MaxLength, Min, MinLength, ValidateNested } from 'class-validator';

export class CreateTenantAdminDTO {
    @IsString()
    @MinLength(3)
    fullname!: string

    @IsString()
    @MinLength(2)
    email!: string

    @IsString()
    @MinLength(9)
    @MaxLength(20)
    phone!: string

    @IsString()
    @MinLength(8)
    @MaxLength(20)
    password: string = process.env.DEFAULT_ADMIN_PASSWORD ?? ""

    @IsArray()
    @IsNumber({}, { each: true })
    permissionIds!: number[]
}
export class CreateTenantDTO {
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    name!: string

    @ValidateNested()
    @Type(() => CreateTenantAdminDTO)
    @IsDefined()
    admin!: CreateTenantAdminDTO

    @IsNumber()
    @Min(1)
    subscriptionId!: number
}

