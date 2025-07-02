import { ApiProperty } from '@nestjs/swagger';
import { UpdateCommentDto } from '../../dto/update-comment.dto';

export class UpdateCommentInputDto implements UpdateCommentDto {
  @ApiProperty()
  content: string;
}
