import { AuthorSummary } from './posts.types';

export interface PublicComment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: AuthorSummary;
}

export interface PaginatedComments {
  items: PublicComment[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface CommentQueryRow {
  comment_id: string;
  comment_content: string;
  comment_created_at: Date | string;
  comment_updated_at: Date | string;
  author_id: string;
  author_name: string;
}
