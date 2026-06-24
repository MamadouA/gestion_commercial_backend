import { IsInt, IsPositive, IsString, MinLength } from "class-validator";


export class CreateCommentDTO {
    @IsString()
    @MinLength(5)
    content!: string;

    @IsInt()
    @IsPositive()
    postId!: number;
}