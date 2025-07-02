import { ApiProperty } from '@nestjs/swagger';
import {
  CreatePostDto,
  CreatePostByBlogIdDto,
} from '../../dto/create-post.dto';

export class CreatePostInputDto implements CreatePostDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  shortDescription: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  blogId: string;
}

export class CreatePostByBlogIdInputDto implements CreatePostByBlogIdDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  shortDescription: string;

  @ApiProperty()
  content: string;
}
