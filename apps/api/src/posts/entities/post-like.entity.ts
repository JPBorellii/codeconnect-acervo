import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { PostEntity } from './post.entity';

@Entity({ name: 'post_likes' })
@Unique('post_likes_post_id_user_id_unique', ['postId', 'userId'])
export class PostLikeEntity {
  @PrimaryColumn('uuid', { name: 'post_id' })
  postId!: string;

  @ManyToOne(() => PostEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({
    name: 'post_id',
    foreignKeyConstraintName: 'post_likes_post_id_fkey',
  })
  post!: PostEntity;

  @PrimaryColumn('uuid', { name: 'user_id' })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'post_likes_user_id_fkey',
  })
  user!: UserEntity;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'now()',
  })
  createdAt!: Date;
}
