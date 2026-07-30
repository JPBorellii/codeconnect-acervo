import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostLikeEntity } from './entities/post-like.entity';
import { PostEntity } from './entities/post.entity';

export interface LikeState {
  liked: boolean;
  likeCount: number;
}

@Injectable()
export class PostLikesService {
  constructor(
    @InjectRepository(PostLikeEntity)
    private readonly likesRepository: Repository<PostLikeEntity>,
    @InjectRepository(PostEntity)
    private readonly postsRepository: Repository<PostEntity>,
  ) {}

  async get(postId: string, userId: string): Promise<LikeState> {
    await this.ensurePost(postId);
    return this.state(postId, userId);
  }

  async like(postId: string, userId: string): Promise<LikeState> {
    await this.ensurePost(postId);
    await this.likesRepository
      .createQueryBuilder()
      .insert()
      .into(PostLikeEntity)
      .values({ postId, userId })
      .orIgnore()
      .execute();
    return this.state(postId, userId);
  }

  async unlike(postId: string, userId: string): Promise<LikeState> {
    await this.ensurePost(postId);
    await this.likesRepository.delete({ postId, userId });
    const result = await this.state(postId, userId);
    return { ...result, liked: false };
  }

  private async state(postId: string, userId: string): Promise<LikeState> {
    const [liked, likeCount] = await Promise.all([
      this.likesRepository.existsBy({ postId, userId }),
      this.likesRepository.countBy({ postId }),
    ]);
    return { liked, likeCount };
  }

  private async ensurePost(id: string): Promise<void> {
    if (!(await this.postsRepository.existsBy({ id })))
      throw new NotFoundException('Post não encontrado');
  }
}
