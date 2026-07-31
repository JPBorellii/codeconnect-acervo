import { Injectable } from '@nestjs/common';
import { ListPostsQueryDto } from '../posts/dto/list-posts-query.dto';
import { PostsService } from '../posts/posts.service';
import { PaginatedPosts } from '../posts/posts.types';
import { ListMyPostsQueryDto } from './dto/list-my-posts-query.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly postsService: PostsService) {}

  listMyPosts(
    userId: string,
    query: ListMyPostsQueryDto,
  ): Promise<PaginatedPosts> {
    const postsQuery = Object.assign(new ListPostsQueryDto(), {
      page: query.page,
      limit: query.limit,
    });
    return this.postsService.listByAuthorId(userId, postsQuery);
  }
}
