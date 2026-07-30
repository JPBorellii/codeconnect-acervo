import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePosts1785398400000 implements MigrationInterface {
  name = 'CreatePosts1785398400000';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "posts" (
      "id" uuid NOT NULL, "author_id" uuid NOT NULL, "title" varchar(150) NOT NULL,
      "content" varchar(10000) NOT NULL, "thumbnail_url" varchar(2048),
      "created_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "posts_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT "posts_title_not_blank_check" CHECK (length(btrim("title")) > 0),
      CONSTRAINT "posts_content_not_blank_check" CHECK (length(btrim("content")) > 0)
    )`);
    await queryRunner.query(
      'CREATE INDEX "posts_created_at_id_idx" ON "posts" ("created_at" DESC, "id" DESC)',
    );
    await queryRunner.query(`CREATE INDEX "posts_search_gin_idx" ON "posts" USING GIN ((
      setweight(to_tsvector('portuguese', coalesce("title", '')), 'A') ||
      setweight(to_tsvector('portuguese', coalesce("content", '')), 'B')
    ))`);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "posts_search_gin_idx"');
    await queryRunner.query('DROP INDEX IF EXISTS "posts_created_at_id_idx"');
    await queryRunner.query('DROP TABLE IF EXISTS "posts"');
  }
}
