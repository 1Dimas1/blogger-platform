import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePostDto, CreatePostByBlogIdDto } from '../dto/create-post.dto';
import { Post, PostDocument, PostModelType } from '../domain/post.entity';
import {
  ExtendedLikesInfo,
  LikeDetails,
} from '../domain/extended-likes-info.schema';
import { UpdatePostDto } from '../dto/update-post.dto';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';
import { BlogDocument } from '../../blogs/domain/blog.entity';
import { PostsRepository } from '../infrastructure/posts.repository';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
  ) {}

  async createPost(dto: CreatePostDto): Promise<string> {
    const blog: BlogDocument = await this.blogsRepository.findOrNotFoundFail(
      dto.blogId,
    );

    const post: PostDocument = this.PostModel.createInstance({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
      blogName: blog.name,
    });

    await this.postsRepository.save(post);

    return post._id.toString();
  }

  async createPostByBlogId(
    blogId: string,
    dto: CreatePostByBlogIdDto,
  ): Promise<string> {
    const blog: BlogDocument =
      await this.blogsRepository.findOrNotFoundFail(blogId);

    const post: PostDocument = this.PostModel.createInstance({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blogId,
      blogName: blog.name,
    });

    await this.postsRepository.save(post);

    return post._id.toString();
  }

  async updatePost(id: string, dto: UpdatePostDto): Promise<void> {
    const post: PostDocument =
      await this.postsRepository.findOrNotFoundFail(id);

    post.update(dto);

    await this.postsRepository.save(post);
  }

  async deletePost(id: string): Promise<void> {
    const post: PostDocument =
      await this.postsRepository.findOrNotFoundFail(id);

    post.makeDeleted();

    await this.postsRepository.save(post);
  }

  async updatePostLikesInfo(
    postId: string,
    likesCount: number,
    dislikesCount: number,
    newestLikes: LikeDetails[],
  ): Promise<void> {
    const post: PostDocument =
      await this.postsRepository.findOrNotFoundFail(postId);

    const extendedLikesInfo: ExtendedLikesInfo = {
      likesCount,
      dislikesCount,
      newestLikes,
    };

    post.updateLikesInfo(extendedLikesInfo);

    await this.postsRepository.save(post);
  }
}
