import { CreateCommentDto } from '../../dto/create-comment.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentInputDto implements CreateCommentDto {
  @ApiProperty()
  content: string;
}
