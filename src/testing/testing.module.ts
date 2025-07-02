import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TestingController } from './api/testing.controller';
import { TestingService } from './application/testing.service';
import {
  Blog,
  BlogSchema,
} from '../modules/blogger-platform/blogs/domain/blog.entity';
import {
  Post,
  PostSchema,
} from '../modules/blogger-platform/posts/domain/post.entity';
import {
  Comment,
  CommentSchema,
} from '../modules/blogger-platform/comments/domain/comment.entity';
import {
  Like,
  LikeSchema,
} from '../modules/blogger-platform/likes/domain/like.entity';
import { User, UserSchema } from '../modules/user-accounts/domain/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Like.name, schema: LikeSchema },
      { name: User.name, schema: UserSchema },
      // TODO: Add these when auth and security modules are migrated:
      // { name: SecurityDevice.name, schema: SecurityDeviceSchema },
      // { name: InvalidRefreshToken.name, schema: InvalidRefreshTokenSchema },
      // { name: RateLimit.name, schema: RateLimitSchema },
    ]),
  ],
  controllers: [TestingController],
  providers: [TestingService],
  exports: [TestingService],
})
export class TestingModule {}
