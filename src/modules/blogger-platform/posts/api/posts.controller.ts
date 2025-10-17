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
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBasicAuth,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PostsService } from '../application/posts.service';
import { PostViewDto } from './view-dto/post.view-dto';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';
import { Constants } from '../../../../core/constants';
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
import { BasicAuthGuard } from '../../../user-accounts/guards/basic/basic-auth.guard';
import { JwtAuthGuard } from '../../../user-accounts/guards/bearer/jwt-auth.guard';
import { ExtractUserFromRequest } from '../../../user-accounts/guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../../../user-accounts/guards/dto/user-context.dto';

@ApiTags('Posts')
@Controller(Constants.PATH.POSTS)
export class PostsController {
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private postsService: PostsService,
    private likesService: LikesService,
    private commentsQueryRepository: CommentsQueryRepository,
    private commentsService: CommentsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Returns all posts' })
  @ApiResponse({ status: 200, description: 'Success' })
  async getPosts(
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.postsQueryRepository.getAll(query, null);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Return post by id' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  async getPostById(@Param('id') id: string): Promise<PostViewDto> {
    return this.postsQueryRepository.getByIdOrNotFoundFail(id, null);
  }

  @Get(':postId/comments')
  @ApiOperation({ summary: 'Returns comments for specified post' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({
    status: 404,
    description: "If post for passed postId doesn't exist",
  })
  async getCommentsByPost(
    @Param('postId') postId: string,
    @Query() query: GetCommentsQueryParams,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    await this.postsQueryRepository.getByIdOrNotFoundFail(postId, null);

    return this.commentsQueryRepository.getAllByPostId(postId, query, null);
  }

  @Post(':postId/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new comment' })
  @ApiResponse({ status: 201, description: 'Returns the newly created post' })
  @ApiResponse({
    status: 400,
    description: 'If the inputModel has incorrect values',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 404,
    description: "If post with specified postId doesn't exists",
  })
  async createComment(
    @Param('postId') postId: string,
    @Body() body: CreateCommentInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<CommentViewDto> {
    const commentId: string = await this.commentsService.createComment(
      postId,
      body,
      user.id,
    );

    return this.commentsQueryRepository.getByIdOrNotFoundFail(
      commentId,
      user.id,
    );
  }

  @Put(':postId/like-status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Make like/unlike/dislike/undislike operation' })
  @ApiResponse({ status: 204, description: '' })
  @ApiResponse({
    status: 400,
    description: 'If the inputModel has incorrect values',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 404,
    description: "If post with specified postId doesn't exists",
  })
  async updatePostLikeStatus(
    @Param('postId') postId: string,
    @Body() body: LikeInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    return this.likesService.updatePostLikeStatus(postId, body, user.id);
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  @ApiOperation({ summary: 'Create new post' })
  @ApiResponse({ status: 201, description: 'Returns the newly created post' })
  @ApiResponse({
    status: 400,
    description: 'If the inputModel has incorrect values',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createPost(@Body() body: CreatePostInputDto): Promise<PostViewDto> {
    const postId = await this.postsService.createPost(body);

    return this.postsQueryRepository.getByIdOrNotFoundFail(postId, null);
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update existing post by id with InputModel' })
  @ApiResponse({ status: 204, description: 'No Content' })
  @ApiResponse({
    status: 400,
    description: 'If the inputModel has incorrect values',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  async updatePost(
    @Param('id') id: string,
    @Body() body: UpdatePostInputDto,
  ): Promise<void> {
    return this.postsService.updatePost(id, body);
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete post specified by id' })
  @ApiResponse({ status: 204, description: 'No Content' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  async deletePost(@Param('id') id: string): Promise<void> {
    return this.postsService.deletePost(id);
  }
}
