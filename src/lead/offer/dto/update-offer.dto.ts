import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  Validate,
  ValidateNested,
} from 'class-validator';
import { OfferStatus } from '../../../generated/prisma/enums';
import { CreateCommentDTO } from '../../../comment/dto/create.comment.dto';
import { Type } from 'class-transformer';

export class UpdateOfferDTO {
  @IsString()
  @MinLength(3)
  @IsOptional()
  title?: string;

  @IsEnum(OfferStatus)
  @IsOptional()
  status?: OfferStatus;

  @IsString()
  @MinLength(3)
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  amountIncludingTax?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  amountExcludingTax?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  vatAmount?: number;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;
}
