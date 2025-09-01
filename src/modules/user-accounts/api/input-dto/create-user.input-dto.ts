import { CreateUserDto } from '../../dto/create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  emailConstraints,
  loginConstraints,
  passwordConstraints,
} from '../../domain/user.entity';
import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { IsStringWithTrim } from '../../../../core/decorators/validation/is-string-with-trim';
import { Trim } from '../../../../core/decorators/transform/trim';

export class CreateUserInputDto implements CreateUserDto {
  @ApiProperty()
  @IsStringWithTrim(loginConstraints.minLength, loginConstraints.maxLength)
  login: string;

  @ApiProperty()
  @IsString()
  @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
  @Trim()
  password: string;

  @ApiProperty()
  @IsString()
  @IsEmail()
  @Matches(emailConstraints.match)
  @Trim()
  email: string;
}
