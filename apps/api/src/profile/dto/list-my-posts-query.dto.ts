import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

const toInteger = ({ value }: { value: unknown }) =>
  typeof value === 'string' && value.trim().length > 0 ? Number(value) : value;

export class ListMyPostsQueryDto {
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
