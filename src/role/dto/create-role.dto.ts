import { IsArray, IsNumber, IsString, MaxLength, MinLength } from "class-validator";

export class CreateRoleDTO {
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    name!: string;

    @IsString()
    @MaxLength(100)
    description!: string;

    @IsArray()
    @IsNumber({}, { each: true })
    permissionIds: number[] = [];
}