import { ApiProperty } from '@nestjs/swagger';
import { UpdateBlogDto } from '../../dto/update-blog.dto';
import { IsString, IsUrl, Length } from 'class-validator';
import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim';

export class UpdateBlogInputDto implements UpdateBlogDto {
  @ApiProperty()
  @IsStringWithTrim(1, 15)
  name: string;

  @ApiProperty()
  @IsStringWithTrim(1, 500)
  description: string;

  @ApiProperty()
  @IsString()
  @IsUrl()
  @Length(1, 100)
  websiteUrl: string;
}
