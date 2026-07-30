import { PostDetail, PostQueryRow, PostSummary } from './posts.types';

const excerptLength = 240;

export function createExcerpt(content: string): string {
  const normalized = content.replace(/\s+/gu, ' ').trim();
  const characters = Array.from(normalized);
  if (characters.length <= excerptLength) return normalized;
  return `${characters.slice(0, excerptLength).join('')}…`;
}

function authorFor(row: PostQueryRow) {
  return { id: row.author_id, name: row.author_name };
}

function createdAtFor(row: PostQueryRow): string {
  return new Date(row.post_created_at).toISOString();
}

export function toPostSummary(row: PostQueryRow): PostSummary {
  return {
    id: row.post_id,
    title: row.post_title,
    excerpt: createExcerpt(row.post_content),
    thumbnailUrl: row.post_thumbnail_url,
    author: authorFor(row),
    commentCount: Number(row.post_comment_count),
    likeCount: Number(row.post_like_count),
    createdAt: createdAtFor(row),
  };
}

export function toPostDetail(row: PostQueryRow): PostDetail {
  return {
    id: row.post_id,
    title: row.post_title,
    content: row.post_content,
    thumbnailUrl: row.post_thumbnail_url,
    author: authorFor(row),
    commentCount: Number(row.post_comment_count),
    likeCount: Number(row.post_like_count),
    createdAt: createdAtFor(row),
  };
}
