import { IsString, MinLength } from "class-validator";

export class CreateJournalEventDTO {
    @IsString()
    @MinLength(3)
    event!: string;
}