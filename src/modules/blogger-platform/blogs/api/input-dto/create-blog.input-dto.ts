import { CreateBlogDto } from '../../dto/create-blog.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBlogInputDto implements CreateBlogDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  websiteUrl: string;
}
