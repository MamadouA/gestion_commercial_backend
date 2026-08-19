import { IsEnum, IsNumber, IsString, Min, MinLength } from "class-validator";


export class CreateCommentDTO {
    @IsString()
    @MinLength(5)
    content!: string;

    @IsEnum(["PROJECT", "OFFER", "PROSPECTION"])
    resourceType!: string;

    @IsNumber()
    @Min(1)
    resourceId!: number;
}