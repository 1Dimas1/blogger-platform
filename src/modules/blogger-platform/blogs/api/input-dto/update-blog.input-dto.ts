import { ApiProperty } from '@nestjs/swagger';
import { UpdateBlogDto } from '../../dto/update-blog.dto';

export class UpdateBlogInputDto implements UpdateBlogDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  websiteUrl: string;
}
