import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Blog,
  BlogDocument,
} from '../../modules/blogger-platform/blogs/domain/blog.entity';
import {
  Post,
  PostDocument,
} from '../../modules/blogger-platform/posts/domain/post.entity';
import {
  Comment,
  CommentDocument,
} from '../../modules/blogger-platform/comments/domain/comment.entity';
import {
  Like,
  LikeDocument,
} from '../../modules/blogger-platform/likes/domain/like.entity';
import {
  User,
  UserDocument,
} from '../../modules/user-accounts/domain/user.entity';
import { SETTINGS } from '../../core/settings';

@Injectable()
export class TestingService {
  private readonly logger: Logger = new Logger(TestingService.name);

  constructor(
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async deleteAllData(): Promise<void> {
    try {
      this.logger.log('Starting to clear all collections...');

      const collections = [
        { name: SETTINGS.POST_COLLECTION_NAME, model: this.postModel },
        { name: SETTINGS.BLOG_COLLECTION_NAME, model: this.blogModel },
        { name: SETTINGS.USER_COLLECTION_NAME, model: this.userModel },
        { name: SETTINGS.COMMENT_COLLECTION_NAME, model: this.commentModel },
        { name: SETTINGS.LIKE_COLLECTION_NAME, model: this.likeModel },
        // TODO: Add when auth modules are migrated:
        // { name: 'security-devices', model: this.securityDeviceModel },
        // { name: 'invalid-refresh-tokens', model: this.invalidRefreshTokenModel },
        // { name: 'rate-limits', model: this.rateLimitModel },
      ];

      for (const { name, model } of collections) {
        try {
          await model.collection.drop();
          this.logger.log(`Successfully dropped ${name} collection`);
        } catch (error) {
          if (error.code === 26 || error.codeName === 'NamespaceNotFound') {
            this.logger.log(`Collection ${name} does not exist, skipping...`);
          } else {
            this.logger.warn(
              `Error dropping ${name} collection:`,
              error.message,
            );
          }
        }
      }

      this.logger.log('Successfully cleared all collections');
    } catch (error) {
      this.logger.error('Error occurred while clearing collections:', error);
      throw error;
    }
  }
}
