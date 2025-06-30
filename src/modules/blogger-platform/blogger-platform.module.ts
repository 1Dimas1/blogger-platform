import { Module } from '@nestjs/common';
import { BlogsService } from './blogs/application/blogs.service';
import { BlogsController } from './blogs/api/blogs.controller';
import { PostsController } from './posts/api/posts.controller';
import { PostsService } from './posts/application/posts.service';

@Module({
  providers: [BlogsService, PostsService],
  controllers: [BlogsController, PostsController],
})
export class BloggerPlatformModule {}
