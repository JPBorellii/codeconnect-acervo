import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { CommentEntity } from './entities/comment.entity';
import { PostLikeEntity } from './entities/post-like.entity';
import { CommentsService } from './comments.service';
import { PostLikesService } from './post-likes.service';
import { AuthModule } from '../auth/auth.module';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([PostEntity, CommentEntity, PostLikeEntity]),
  ],
  controllers: [PostsController],
  providers: [PostsService, CommentsService, PostLikesService],
})
export class PostsModule {}
