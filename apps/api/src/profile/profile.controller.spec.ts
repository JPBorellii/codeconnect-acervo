import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { ListMyPostsQueryDto } from './dto/list-my-posts-query.dto';

describe('ProfileController', () => {
  it('uses only the JWT subject when listing the current user posts', () => {
    const result = {
      items: [],
      meta: { page: 1, limit: 12, total: 0, totalPages: 0 },
    };
    const listMyPosts = jest.fn().mockReturnValue(result);
    const controller = new ProfileController({ listMyPosts } as ProfileService);
    const user = {
      sub: 'a0000000-0000-4000-8000-000000000001',
      email: 'ada@example.com',
    };
    const query = new ListMyPostsQueryDto();

    expect(controller.listMyPosts(user, query)).toBe(result);
    expect(listMyPosts).toHaveBeenCalledWith(user.sub, query);
  });
});
