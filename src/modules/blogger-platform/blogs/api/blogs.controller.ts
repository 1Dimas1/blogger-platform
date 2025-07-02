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
import { SETTINGS } from '../../../../core/settings';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { UpdateBlogInputDto } from './input-dto/update-blog.input-dto';
import { CreateBlogInputDto } from './input-dto/create-blog.input-dto';
import { BlogViewDto } from './view-dto/blogs.view-dto';
import { BlogsService } from '../application/blogs.service';
import { PostsService } from '../../posts/application/posts.service';
import { BlogsQueryRepository } from '../infrastructure/blogs.query-repository';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query-repository';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';
import { PostViewDto } from '../../posts/api/view-dto/post.view-dto';
import { CreatePostByBlogIdInputDto } from '../../posts/api/input-dto/create-post.input-dto';

@Controller(SETTINGS.PATH.BLOGS)
export class BlogsController {
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private blogsService: BlogsService,
    private postsQueryRepository: PostsQueryRepository,
    private postsService: PostsService,
  ) {}

  @Get()
  async getBlogs(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.blogsQueryRepository.getAll(query);
  }

  @Get(':id')
  async getBlogById(@Param('id') id: string): Promise<BlogViewDto> {
    return this.blogsQueryRepository.getByIdOrNotFoundFail(id);
  }

  @Get(':id/posts')
  async getPostsByBlogId(
    @Param('id') blogId: string,
    @Query() query: GetPostsQueryParams,
    // @UserId() userId?: string, // TODO: Implement optional auth decorator
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    // Verify blog exists
    await this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);

    return this.postsQueryRepository.getAllByBlogId(blogId, query, null);
  }

  @Post(':id/posts')
  async createPostByBlogId(
    @Param('id') blogId: string,
    @Body() body: CreatePostByBlogIdInputDto,
  ): Promise<PostViewDto> {
    await this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);

    const postId = await this.postsService.createPostByBlogId(blogId, body);

    return this.postsQueryRepository.getByIdOrNotFoundFail(postId, null);
  }

  @Post()
  async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {
    const blogId = await this.blogsService.createBlog(body);

    return this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id') id: string,
    @Body() body: UpdateBlogInputDto,
  ): Promise<void> {
    return this.blogsService.updateBlog(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string): Promise<void> {
    return this.blogsService.deleteBlog(id);
  }
}
