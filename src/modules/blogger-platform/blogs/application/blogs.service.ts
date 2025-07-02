import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument, BlogModelType } from '../domain/blog.entity';
import { InjectModel } from '@nestjs/mongoose';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import { BlogsRepository } from '../infrastructure/blogs.repository';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    private blogsRepository: BlogsRepository,
  ) {}

  async createBlog(dto: CreateBlogDto): Promise<string> {
    const blog: BlogDocument = this.BlogModel.createInstance({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    });

    await this.blogsRepository.save(blog);

    return blog._id.toString();
  }

  async updateBlog(id: string, dto: UpdateBlogDto): Promise<void> {
    const blog: BlogDocument =
      await this.blogsRepository.findOrNotFoundFail(id);

    blog.update(dto);

    await this.blogsRepository.save(blog);
  }

  async deleteBlog(id: string): Promise<void> {
    const blog: BlogDocument =
      await this.blogsRepository.findOrNotFoundFail(id);

    blog.makeDeleted();

    await this.blogsRepository.save(blog);
  }
}
