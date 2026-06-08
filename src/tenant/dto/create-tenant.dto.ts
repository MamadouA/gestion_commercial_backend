import { Type } from "class-transformer";
import { CreateUserDto } from "../../user/dto/create-user.dto";
import { IsBoolean, isBoolean, IsDateString, IsDefined, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';
export class CreateTenantDto {
   
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    name!: string;

    @ValidateNested()
    @Type(() => CreateUserDto)
    @IsDefined()
    user!: CreateUserDto;
}
