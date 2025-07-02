import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PostsService } from '../application/posts.service';
import { PostViewDto } from './view-dto/post.view-dto';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';
import { SETTINGS } from '../../../../core/settings';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { CreatePostInputDto } from './input-dto/create-post.input-dto';
import { UpdatePostInputDto } from './input-dto/update-post.input-dto';
import { PostsQueryRepository } from '../infrastructure/posts.query-repository';
import { LikesService } from '../../likes/application/likes.service';
import { LikeInputDto } from '../../likes/api/input-dto/like.input-dto';
import { CommentsService } from '../../comments/application/comments.service';
import { CommentsQueryRepository } from '../../comments/infrastructure/comments.query-repository';
import { GetCommentsQueryParams } from '../../comments/api/input-dto/get-comments-query-params.input-dto';
import { CommentViewDto } from '../../comments/api/view-dto/comment.view-dto';
import { CreateCommentInputDto } from '../../comments/api/input-dto/create-comment.input-dto';

@Controller(SETTINGS.PATH.POSTS)
export class PostsController {
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private postsService: PostsService,
    private likesService: LikesService,
    private commentsQueryRepository: CommentsQueryRepository,
    private commentsService: CommentsService,
  ) {}

  @Get()
  async getPosts(
    @Query() query: GetPostsQueryParams,
    // @UserId() userId?: string, // TODO: Implement optional auth decorator
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.postsQueryRepository.getAll(query, null);
  }

  @Get(':id')
  async getPostById(
    @Param('id') id: string,
    // @UserId() userId?: string, // TODO: Implement optional auth decorator
  ): Promise<PostViewDto> {
    return this.postsQueryRepository.getByIdOrNotFoundFail(id, null);
  }

  @Get(':id/comments')
  async getCommentsByPost(
    @Param('id') postId: string,
    @Query() query: GetCommentsQueryParams,
    // @UserId() userId?: string, // TODO: Implement optional auth decorator
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    // Verify post exists
    await this.postsQueryRepository.getByIdOrNotFoundFail(postId, null);

    return this.commentsQueryRepository.getAllByPostId(postId, query, null);
  }

  @Post(':id/comments')
  async createComment(
    @Param('id') postId: string,
    @Body() body: CreateCommentInputDto,
    // @UserId() userId: string, // TODO: Implement auth decorator
  ): Promise<CommentViewDto> {
    const userId = 'temp-user-id'; // TODO: Get from auth

    const commentId = await this.commentsService.createComment(
      postId,
      body,
      userId,
    );

    return this.commentsQueryRepository.getByIdOrNotFoundFail(
      commentId,
      userId,
    );
  }

  @Put(':id/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostLikeStatus(
    @Param('id') postId: string,
    @Body() body: LikeInputDto,
    // @UserId() userId: string, // TODO: Implement auth decorator
  ): Promise<void> {
    const userId = 'temp-user-id'; // TODO: Get from auth

    return this.likesService.updatePostLikeStatus(postId, body, userId);
  }

  @Post()
  async createPost(@Body() body: CreatePostInputDto): Promise<PostViewDto> {
    const postId = await this.postsService.createPost(body);

    return this.postsQueryRepository.getByIdOrNotFoundFail(postId, null);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('id') id: string,
    @Body() body: UpdatePostInputDto,
  ): Promise<void> {
    return this.postsService.updatePost(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string): Promise<void> {
    return this.postsService.deletePost(id);
  }
}
