import { Transform } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

const toInteger = ({ value }: { value: unknown }) =>
  typeof value === 'string' && value.trim().length > 0 ? Number(value) : value;

export class ListCommentsQueryDto {
  @Transform(toInteger)
  @IsInt()
  @Min(1)
  page = 1;

  @Transform(toInteger)
  @IsInt()
  @Min(1)
  @Max(50)
  limit = 12;
}
