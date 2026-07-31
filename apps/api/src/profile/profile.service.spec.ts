import { ListPostsQueryDto } from '../posts/dto/list-posts-query.dto';
import { PaginatedPosts } from '../posts/posts.types';
import { PostsService } from '../posts/posts.service';
import { ListMyPostsQueryDto } from './dto/list-my-posts-query.dto';
import { ProfileService } from './profile.service';

describe('ProfileService', () => {
  const response: PaginatedPosts = {
    items: [],
    meta: { page: 1, limit: 12, total: 0, totalPages: 0 },
  };
  let listByAuthorId: jest.Mock<
    Promise<PaginatedPosts>,
    [string, ListPostsQueryDto]
  >;
  let service: ProfileService;

  beforeEach(() => {
    listByAuthorId = jest.fn<
      Promise<PaginatedPosts>,
      [string, ListPostsQueryDto]
    >();
    listByAuthorId.mockResolvedValue(response);
    service = new ProfileService({ listByAuthorId } as Pick<
      PostsService,
      'listByAuthorId'
    > as PostsService);
  });

  it('delegates the authenticated user id and existing pagination contract', async () => {
    const userId = 'a0000000-0000-4000-8000-000000000001';
    await expect(
      service.listMyPosts(
        userId,
        Object.assign(new ListMyPostsQueryDto(), { page: 2, limit: 5 }),
      ),
    ).resolves.toEqual(response);
    expect(listByAuthorId).toHaveBeenCalledWith(
      userId,
      expect.objectContaining({ page: 2, limit: 5 }),
    );
  });

  it('preserves an empty result and numeric public counts', async () => {
    const paginated: PaginatedPosts = {
      items: [
        {
          id: 'b0000000-0000-4000-8000-000000000001',
          title: 'Post',
          excerpt: 'Resumo',
          thumbnailUrl: null,
          author: { id: 'a0000000-0000-4000-8000-000000000001', name: 'Ada' },
          commentCount: 2,
          likeCount: 3,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      meta: { page: 1, limit: 12, total: 1, totalPages: 1 },
    };
    listByAuthorId.mockResolvedValueOnce(paginated);
    const result = await service.listMyPosts(
      'a0000000-0000-4000-8000-000000000001',
      new ListMyPostsQueryDto(),
    );
    expect(result.items[0]).not.toHaveProperty('email');
    expect(typeof result.items[0]?.commentCount).toBe('number');
    expect(typeof result.items[0]?.likeCount).toBe('number');
  });

  it('propagates the posts service error', async () => {
    const error = new Error('database unavailable');
    listByAuthorId.mockRejectedValueOnce(error);
    await expect(
      service.listMyPosts(
        'a0000000-0000-4000-8000-000000000001',
        new ListMyPostsQueryDto(),
      ),
    ).rejects.toBe(error);
  });
});
