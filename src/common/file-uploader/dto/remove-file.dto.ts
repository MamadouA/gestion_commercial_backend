import { IsNotEmpty, IsString } from "class-validator";

export class RemoveFileDTO {
    @IsString()
    @IsNotEmpty()
    key!: string
}