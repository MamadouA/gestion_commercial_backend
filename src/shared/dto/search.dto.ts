import { IsNotEmpty, IsString } from "class-validator";
import { PaginationDTO } from "./pagination";

export class SearchDTO extends PaginationDTO {
  @IsString()
  keyword!: string;
}