import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ListCommentsQueryDto } from './dto/list-comments-query.dto';
import { CommentEntity } from './entities/comment.entity';
import { PostEntity } from './entities/post.entity';
import {
  CommentQueryRow,
  PaginatedComments,
  PublicComment,
} from './comments.types';

function toPublicComment(row: CommentQueryRow): PublicComment {
  return {
    id: row.comment_id,
    content: row.comment_content,
    createdAt: new Date(row.comment_created_at).toISOString(),
    updatedAt: new Date(row.comment_updated_at).toISOString(),
    author: { id: row.author_id, name: row.author_name },
  };
}

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentsRepository: Repository<CommentEntity>,
    @InjectRepository(PostEntity)
    private readonly postsRepository: Repository<PostEntity>,
  ) {}

  async list(
    postId: string,
    query: ListCommentsQueryDto,
  ): Promise<PaginatedComments> {
    await this.ensurePost(postId);
    const builder = this.commentsRepository
      .createQueryBuilder('comment')
      .innerJoin('comment.author', 'author')
      .where('comment.post_id = :postId', { postId });
    const total = await builder.clone().getCount();
    const rows = await builder
      .select([
        'comment.id AS comment_id',
        'comment.content AS comment_content',
        'comment.created_at AS comment_created_at',
        'comment.updated_at AS comment_updated_at',
        'author.id AS author_id',
        'author.name AS author_name',
      ])
      .orderBy('comment.created_at', 'ASC')
      .addOrderBy('comment.id', 'ASC')
      .offset((query.page - 1) * query.limit)
      .limit(query.limit)
      .getRawMany<CommentQueryRow>();
    return {
      items: rows.map(toPublicComment),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / query.limit),
      },
    };
  }

  async create(
    postId: string,
    authorId: string,
    dto: CreateCommentDto,
  ): Promise<PublicComment> {
    await this.ensurePost(postId);
    const comment = this.commentsRepository.create({
      id: randomUUID(),
      postId,
      authorId,
      content: dto.content,
    });
    try {
      await this.commentsRepository.save(comment);
    } catch (error: unknown) {
      if (this.isPostForeignKeyError(error))
        throw new NotFoundException('Post não encontrado');
      throw error;
    }
    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      author: await this.authorFor(authorId),
    };
  }

  private async ensurePost(id: string): Promise<void> {
    if (!(await this.postsRepository.existsBy({ id })))
      throw new NotFoundException('Post não encontrado');
  }

  private async authorFor(id: string): Promise<{ id: string; name: string }> {
    const row = await this.commentsRepository
      .createQueryBuilder('comment')
      .innerJoin('comment.author', 'author')
      .select(['author.id AS author_id', 'author.name AS author_name'])
      .where('author.id = :id', { id })
      .getRawOne<{ author_id: string; author_name: string }>();
    if (!row) throw new NotFoundException('Usuário não encontrado');
    return { id: row.author_id, name: row.author_name };
  }

  private isPostForeignKeyError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      (error as { code?: unknown }).code === '23503'
    );
  }
}
