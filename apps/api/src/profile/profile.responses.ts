import { ApiProperty } from '@nestjs/swagger';

export class ProfilePostAuthorResponseDto {
  @ApiProperty({ example: 'a0000000-0000-4000-8000-000000000001' })
  id!: string;

  @ApiProperty({ example: 'Maria Silva' })
  name!: string;
}

export class ProfilePostSummaryResponseDto {
  @ApiProperty({ example: 'b0000000-0000-4000-8000-000000000001' })
  id!: string;

  @ApiProperty({ example: 'React com TypeScript' })
  title!: string;

  @ApiProperty({ example: 'Conte\u00fado resumido do post.' })
  excerpt!: string;

  @ApiProperty({ example: null, nullable: true })
  thumbnailUrl!: string | null;

  @ApiProperty({ type: ProfilePostAuthorResponseDto })
  author!: ProfilePostAuthorResponseDto;

  @ApiProperty({ example: 2 })
  commentCount!: number;

  @ApiProperty({ example: 4 })
  likeCount!: number;

  @ApiProperty({ example: '2026-03-01T00:00:00.000Z' })
  createdAt!: string;
}

export class ProfilePostsMetaResponseDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 12 })
  limit!: number;

  @ApiProperty({ example: 24 })
  total!: number;

  @ApiProperty({ example: 2 })
  totalPages!: number;
}

export class PaginatedProfilePostsResponseDto {
  @ApiProperty({ type: ProfilePostSummaryResponseDto, isArray: true })
  items!: ProfilePostSummaryResponseDto[];

  @ApiProperty({ type: ProfilePostsMetaResponseDto })
  meta!: ProfilePostsMetaResponseDto;
}
