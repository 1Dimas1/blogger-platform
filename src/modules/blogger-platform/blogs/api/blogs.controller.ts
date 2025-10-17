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
} from '@nestjs/swagger';
import { Constants } from '../../../../core/constants';
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
import { BasicAuthGuard } from '../../../user-accounts/guards/basic/basic-auth.guard';

@ApiTags('Blogs')
@Controller(Constants.PATH.BLOGS)
export class BlogsController {
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private blogsService: BlogsService,
    private postsQueryRepository: PostsQueryRepository,
    private postsService: PostsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Returns blogs with paging' })
  @ApiResponse({ status: 200, description: 'Success' })
  async getBlogs(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.blogsQueryRepository.getAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Returns blog by id' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  async getBlogById(@Param('id') id: string): Promise<BlogViewDto> {
    return this.blogsQueryRepository.getByIdOrNotFoundFail(id);
  }

  @Get(':blogId/posts')
  @ApiOperation({ summary: 'Returns all posts for specified blog' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({
    status: 404,
    description: 'If specificied blog is not exists',
  })
  async getPostsByBlogId(
    @Param('blogId') blogId: string,
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    await this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);

    return this.postsQueryRepository.getAllByBlogId(blogId, query, null);
  }

  @Post(':blogId/posts')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  @ApiOperation({ summary: 'Create new post for specific blog' })
  @ApiResponse({ status: 201, description: 'Returns the newly created post' })
  @ApiResponse({
    status: 400,
    description: 'If the inputModel has incorrect values',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: "If specified blog doesn't exists" })
  async createPostByBlogId(
    @Param('blogId') blogId: string,
    @Body() body: CreatePostByBlogIdInputDto,
  ): Promise<PostViewDto> {
    await this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);

    const postId = await this.postsService.createPostByBlogId(blogId, body);

    return this.postsQueryRepository.getByIdOrNotFoundFail(postId, null);
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  @ApiOperation({ summary: 'Create new blog' })
  @ApiResponse({ status: 201, description: 'Returns the newly created blog' })
  @ApiResponse({
    status: 400,
    description: 'If the inputModel has incorrect values',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {
    const blogId = await this.blogsService.createBlog(body);

    return this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update existing Blog by id with InputModel' })
  @ApiResponse({ status: 204, description: 'No Content' })
  @ApiResponse({
    status: 400,
    description: 'If the inputModel has incorrect values',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  async updateBlog(
    @Param('id') id: string,
    @Body() body: UpdateBlogInputDto,
  ): Promise<void> {
    return this.blogsService.updateBlog(id, body);
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete blog specified by id' })
  @ApiResponse({ status: 204, description: 'No Content' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  async deleteBlog(@Param('id') id: string): Promise<void> {
    return this.blogsService.deleteBlog(id);
  }
}
