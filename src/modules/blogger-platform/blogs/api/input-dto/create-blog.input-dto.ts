import { CreateBlogDto } from '../../dto/create-blog.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl, Length } from 'class-validator';
import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim';

export class CreateBlogInputDto implements CreateBlogDto {
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
