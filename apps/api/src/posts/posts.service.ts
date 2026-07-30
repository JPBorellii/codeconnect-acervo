import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { ListPostsQueryDto } from './dto/list-posts-query.dto';
import { PostEntity } from './entities/post.entity';
import { toPostDetail, toPostSummary } from './posts.mapper';
import { PaginatedPosts, PostDetail, PostQueryRow } from './posts.types';

const searchVector = (alias: string) =>
  `setweight(to_tsvector('portuguese', coalesce(${alias}.title, '')), 'A') || setweight(to_tsvector('portuguese', coalesce(${alias}.content, '')), 'B')`;

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postsRepository: Repository<PostEntity>,
  ) {}

  async list(query: ListPostsQueryDto): Promise<PaginatedPosts> {
    const builder = this.createPublicQuery();
    this.applySearch(builder, query.q);
    const total = await builder.clone().getCount();
    const rows = await builder
      .offset((query.page - 1) * query.limit)
      .limit(query.limit)
      .getRawMany<PostQueryRow>();
    return {
      items: rows.map(toPostSummary),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / query.limit),
      },
    };
  }

  async findDetail(id: string): Promise<PostDetail> {
    const row = await this.createPublicQuery()
      .where('post.id = :id', { id })
      .getRawOne<PostQueryRow>();
    if (!row) throw new NotFoundException('Post n\u00e3o encontrado');
    return toPostDetail(row);
  }

  async create(authorId: string, dto: CreatePostDto): Promise<PostDetail> {
    const post = await this.postsRepository.save(
      this.postsRepository.create({
        id: randomUUID(),
        authorId,
        title: dto.title,
        content: dto.content,
        thumbnailUrl: dto.thumbnailUrl ?? null,
      }),
    );
    return this.findDetail(post.id);
  }

  private createPublicQuery(): SelectQueryBuilder<PostEntity> {
    return this.postsRepository
      .createQueryBuilder('post')
      .innerJoin('post.author', 'author')
      .select([
        'post.id AS post_id',
        'post.title AS post_title',
        'post.content AS post_content',
        'post.thumbnail_url AS post_thumbnail_url',
        'post.created_at AS post_created_at',
        'author.id AS author_id',
        'author.name AS author_name',
        'COALESCE((SELECT COUNT(*) FROM comments WHERE comments.post_id = post.id), 0) AS post_comment_count',
        'COALESCE((SELECT COUNT(*) FROM post_likes WHERE post_likes.post_id = post.id), 0) AS post_like_count',
      ]);
  }

  private applySearch(
    builder: SelectQueryBuilder<PostEntity>,
    q?: string,
  ): void {
    if (q) {
      const vector = searchVector('post');
      const tsquery = "websearch_to_tsquery('portuguese', :q)";
      builder
        .where(`${vector} @@ ${tsquery}`, { q })
        .orderBy(`ts_rank(${vector}, ${tsquery})`, 'DESC')
        .addOrderBy('post.created_at', 'DESC')
        .addOrderBy('post.id', 'DESC');
      return;
    }
    builder.orderBy('post.created_at', 'DESC').addOrderBy('post.id', 'DESC');
  }
}
