import { ApiProperty } from '@nestjs/swagger';
import { UpdatePostDto } from '../../dto/update-post.dto';

export class UpdatePostInputDto implements UpdatePostDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  shortDescription: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  blogId: string;
}
