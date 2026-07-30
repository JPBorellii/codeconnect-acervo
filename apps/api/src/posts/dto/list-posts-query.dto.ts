import { Transform } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const toOptionalQuery = ({ value }: { value: unknown }) =>
  typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : undefined;
const toInteger = ({ value }: { value: unknown }) =>
  typeof value === 'string' && value.trim().length > 0 ? Number(value) : value;

export class ListPostsQueryDto {
  @Transform(toOptionalQuery)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @Transform(toInteger)
  @IsOptional()
  @IsInt()
  @Min(1)
  page = 1;

  @Transform(toInteger)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit = 12;
}
