import { Module } from '@nestjs/common';
import { BlogsController } from './blogs/api/blogs.controller';
import { PostsController } from './posts/api/posts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/domain/blog.entity';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { BlogsQueryRepository } from './blogs/infrastructure/blogs.query-repository';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { PostsQueryRepository } from './posts/infrastructure/posts.query-repository';
import { CommentsRepository } from './comments/infrastructure/comments.repository';
import { CommentsQueryRepository } from './comments/infrastructure/comments.query-repository';
import { LikesRepository } from './likes/infrastructure/likes.repository';
import { CommentsController } from './comments/api/comments.controller';
import { Post, PostSchema } from './posts/domain/post.entity';
import { Comment, CommentSchema } from './comments/domain/comment.entity';
import { Like, LikeSchema } from './likes/domain/like.entity';
import { CreateBlogUseCase } from './blogs/application/usecases/create-blog.usecase';
import { UpdateBlogUseCase } from './blogs/application/usecases/update-blog.usecase';
import { DeleteBlogUseCase } from './blogs/application/usecases/delete-blog.usecase';
import { GetBlogByIdQueryHandler } from './blogs/application/queries/get-blog-by-id.query';
import { BlogsFactory } from './blogs/application/factories/blogs.factory';
import { CreatePostUseCase } from './posts/application/usecases/create-post.usecase';
import { CreatePostByBlogIdUseCase } from './posts/application/usecases/create-post-by-blog-id.usecase';
import { UpdatePostUseCase } from './posts/application/usecases/update-post.usecase';
import { DeletePostUseCase } from './posts/application/usecases/delete-post.usecase';
import { UpdatePostLikesInfoUseCase } from './posts/application/usecases/update-post-likes-info.usecase';
import { GetPostByIdQueryHandler } from './posts/application/queries/get-post-by-id.query';
import { GetPostsByBlogIdQueryHandler } from './posts/application/queries/get-posts-by-blog-id.query';
import { PostsFactory } from './posts/application/factories/posts.factory';
import { CreateCommentUseCase } from './comments/application/usecases/create-comment.usecase';
import { UpdateCommentUseCase } from './comments/application/usecases/update-comment.usecase';
import { DeleteCommentUseCase } from './comments/application/usecases/delete-comment.usecase';
import { GetCommentByIdQueryHandler } from './comments/application/queries/get-comment-by-id.query';
import { GetCommentsByPostIdQueryHandler } from './comments/application/queries/get-comments-by-post-id.query';
import { CommentsFactory } from './comments/application/factories/comments.factory';
import { UpdatePostLikeStatusUseCase } from './likes/application/usecases/update-post-like-status.usecase';
import { UpdateCommentLikeStatusUseCase } from './likes/application/usecases/update-comment-like-status.usecase';
import { GetBlogsQueryHandler } from './blogs/application/queries/get-blogs.query';
import { GetPostsQueryHandler } from './posts/application/queries/get-posts.query';
import { LikesFactory } from './likes/application/factories/likes.factory';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';

const commandHandlers = [
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  CreatePostUseCase,
  CreatePostByBlogIdUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  UpdatePostLikesInfoUseCase,
  CreateCommentUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
  UpdatePostLikeStatusUseCase,
  UpdateCommentLikeStatusUseCase,
];

const queryHandlers = [
  GetBlogByIdQueryHandler,
  GetBlogsQueryHandler,
  GetPostByIdQueryHandler,
  GetPostsByBlogIdQueryHandler,
  GetPostsQueryHandler,
  GetCommentByIdQueryHandler,
  GetCommentsByPostIdQueryHandler,
];

@Module({
  imports: [
    UserAccountsModule,
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Like.name, schema: LikeSchema },
    ]),
  ],
  controllers: [BlogsController, PostsController, CommentsController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    BlogsFactory,
    PostsFactory,
    CommentsFactory,
    LikesFactory,
    BlogsRepository,
    BlogsQueryRepository,
    PostsRepository,
    PostsQueryRepository,
    CommentsRepository,
    CommentsQueryRepository,
    LikesRepository,
  ],
  exports: [
    BlogsRepository,
    BlogsQueryRepository,
    PostsRepository,
    PostsQueryRepository,
    CommentsRepository,
    CommentsQueryRepository,
    LikesRepository,
  ],
})
export class BloggerPlatformModule {}
