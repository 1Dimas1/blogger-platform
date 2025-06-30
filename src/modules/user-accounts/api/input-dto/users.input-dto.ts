import { CreateUserDto } from '../../dto/create-user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserInputDto implements CreateUserDto {
  @ApiProperty()
  login: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  email: string;
}
