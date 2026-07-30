import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCommentsAndPostLikes1785484800000 implements MigrationInterface {
  name = 'CreateCommentsAndPostLikes1785484800000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "comments" (
      "id" uuid NOT NULL, "post_id" uuid NOT NULL, "author_id" uuid NOT NULL,
      "content" varchar(2000) NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(),
      "updated_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "comments_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT "comments_content_not_blank_check" CHECK (length(btrim("content")) > 0)
    )`);
    await queryRunner.query(
      'CREATE INDEX "comments_post_id_created_at_id_idx" ON "comments" ("post_id", "created_at" ASC, "id" ASC)',
    );
    await queryRunner.query(`CREATE TABLE "post_likes" (
      "post_id" uuid NOT NULL, "user_id" uuid NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "post_likes_pkey" PRIMARY KEY ("post_id", "user_id"),
      CONSTRAINT "post_likes_post_id_user_id_unique" UNIQUE ("post_id", "user_id"),
      CONSTRAINT "post_likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "post_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    )`);
    await queryRunner.query(
      'CREATE INDEX "post_likes_post_id_idx" ON "post_likes" ("post_id")',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "post_likes_post_id_idx"');
    await queryRunner.query('DROP TABLE IF EXISTS "post_likes"');
    await queryRunner.query(
      'DROP INDEX IF EXISTS "comments_post_id_created_at_id_idx"',
    );
    await queryRunner.query('DROP TABLE IF EXISTS "comments"');
  }
}
