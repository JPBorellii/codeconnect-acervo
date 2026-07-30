import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { ListCommentsQueryDto } from './dto/list-comments-query.dto';
import { CommentEntity } from './entities/comment.entity';
import { PostEntity } from './entities/post.entity';

describe('CommentsService', () => {
  const postId = 'b0000000-0000-4000-8000-000000000001';
  const authorId = 'a0000000-0000-4000-8000-000000000001';
  let service: CommentsService;
  const builder = {
    innerJoin: jest.fn(),
    where: jest.fn(),
    clone: jest.fn(),
    getCount: jest.fn(),
    select: jest.fn(),
    orderBy: jest.fn(),
    addOrderBy: jest.fn(),
    offset: jest.fn(),
    limit: jest.fn(),
    getRawMany: jest.fn(),
    getRawOne: jest.fn(),
  };
  const comments = {
    createQueryBuilder: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  const posts = { existsBy: jest.fn() };

  beforeEach(async () => {
    for (const method of [
      'innerJoin',
      'where',
      'select',
      'orderBy',
      'addOrderBy',
      'offset',
      'limit',
    ] as const)
      builder[method].mockReturnValue(builder);
    builder.clone.mockReturnValue({ getCount: builder.getCount });
    builder.getCount.mockResolvedValue(1);
    builder.getRawMany.mockResolvedValue([
      {
        comment_id: 'c0000000-0000-4000-8000-000000000001',
        comment_content: 'Texto',
        comment_created_at: '2026-01-01T00:00:00.000Z',
        comment_updated_at: '2026-01-01T00:00:00.000Z',
        author_id: authorId,
        author_name: 'Ada',
      },
    ]);
    comments.createQueryBuilder.mockReturnValue(builder);
    posts.existsBy.mockResolvedValue(true);
    const module = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: getRepositoryToken(CommentEntity), useValue: comments },
        { provide: getRepositoryToken(PostEntity), useValue: posts },
      ],
    }).compile();
    service = module.get(CommentsService);
  });

  it('lists paginated public comments with stable ordering', async () => {
    await expect(
      service.list(postId, new ListCommentsQueryDto()),
    ).resolves.toMatchObject({
      items: [{ content: 'Texto', author: { id: authorId, name: 'Ada' } }],
      meta: { page: 1, limit: 12, total: 1 },
    });
    expect(builder.orderBy).toHaveBeenCalledWith('comment.created_at', 'ASC');
    expect(builder.addOrderBy).toHaveBeenCalledWith('comment.id', 'ASC');
  });

  it('does not expose database errors when a post disappears during creation', async () => {
    comments.create.mockReturnValue({
      id: 'c0000000-0000-4000-8000-000000000001',
      postId,
      authorId,
      content: 'Texto',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    comments.save.mockRejectedValue({ code: '23503' });
    await expect(
      service.create(postId, authorId, { content: 'Texto' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
