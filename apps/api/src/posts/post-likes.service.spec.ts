import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { PostLikeEntity } from './entities/post-like.entity';
import { PostEntity } from './entities/post.entity';
import { PostLikesService } from './post-likes.service';

describe('PostLikesService', () => {
  let service: PostLikesService;
  const postId = 'b0000000-0000-4000-8000-000000000001';
  const userId = 'a0000000-0000-4000-8000-000000000001';
  const insert = {
    insert: jest.fn(),
    into: jest.fn(),
    values: jest.fn(),
    orIgnore: jest.fn(),
    execute: jest.fn(),
  };
  const likes = {
    createQueryBuilder: jest.fn(),
    existsBy: jest.fn(),
    countBy: jest.fn(),
    delete: jest.fn(),
  };
  const posts = { existsBy: jest.fn() };

  beforeEach(async () => {
    insert.insert.mockReturnValue(insert);
    insert.into.mockReturnValue(insert);
    insert.values.mockReturnValue(insert);
    insert.orIgnore.mockReturnValue(insert);
    insert.execute.mockResolvedValue(undefined);
    likes.createQueryBuilder.mockReturnValue(insert);
    likes.existsBy.mockResolvedValue(false);
    likes.countBy.mockResolvedValue(0);
    likes.delete.mockResolvedValue(undefined);
    posts.existsBy.mockResolvedValue(true);
    const module = await Test.createTestingModule({
      providers: [
        PostLikesService,
        { provide: getRepositoryToken(PostLikeEntity), useValue: likes },
        { provide: getRepositoryToken(PostEntity), useValue: posts },
      ],
    }).compile();
    service = module.get(PostLikesService);
  });

  it('uses an atomic conflict-safe insert and returns the current state', async () => {
    likes.existsBy.mockResolvedValue(true);
    likes.countBy.mockResolvedValue(1);
    await expect(service.like(postId, userId)).resolves.toEqual({
      liked: true,
      likeCount: 1,
    });
    expect(insert.orIgnore).toHaveBeenCalled();
    expect(insert.values).toHaveBeenCalledWith({ postId, userId });
  });

  it('is idempotent when deleting a missing like', async () => {
    await expect(service.unlike(postId, userId)).resolves.toEqual({
      liked: false,
      likeCount: 0,
    });
    expect(likes.delete).toHaveBeenCalledWith({ postId, userId });
  });

  it('returns 404 only when the post does not exist', async () => {
    posts.existsBy.mockResolvedValue(false);
    await expect(service.get(postId, userId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    posts.existsBy.mockResolvedValue(true);
    likes.countBy.mockRejectedValue(new Error('database unavailable'));
    await expect(service.get(postId, userId)).rejects.toThrow(
      'database unavailable',
    );
  });
});
