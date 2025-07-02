import { ApiProperty } from '@nestjs/swagger';
import { LikeDto } from '../../dto/like.dto';
import { LikeStatus } from '../../domain/like.entity';

export class LikeInputDto implements LikeDto {
  @ApiProperty({ enum: LikeStatus })
  likeStatus: LikeStatus;
}
