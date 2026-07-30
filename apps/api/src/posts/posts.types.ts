export interface AuthorSummary {
  id: string;
  name: string;
}

export interface PostSummary {
  id: string;
  title: string;
  excerpt: string;
  thumbnailUrl: string | null;
  author: AuthorSummary;
  commentCount: number;
  likeCount: number;
  createdAt: string;
}

export interface PostDetail extends Omit<PostSummary, 'excerpt'> {
  content: string;
}

export interface PaginatedPosts {
  items: PostSummary[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface PostQueryRow {
  post_id: string;
  post_title: string;
  post_content: string;
  post_thumbnail_url: string | null;
  post_created_at: Date | string;
  author_id: string;
  author_name: string;
  post_comment_count: string | number;
  post_like_count: string | number;
}
