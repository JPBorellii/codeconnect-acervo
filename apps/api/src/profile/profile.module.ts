import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PostsModule } from '../posts/posts.module';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [AuthModule, PostsModule],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
