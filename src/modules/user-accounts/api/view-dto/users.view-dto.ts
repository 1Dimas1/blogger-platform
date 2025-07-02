import { UserDocument } from '../../domain/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UserViewDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  login: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string | null;

  static mapToView(user: UserDocument): UserViewDto {
    const dto = new UserViewDto();

    dto.email = user.email;
    dto.login = user.login;
    dto.id = user._id.toString();
    dto.createdAt = user.createdAt;
    // dto.firstName = user.name.firstName;
    // dto.lastName = user.name.lastName;

    return dto;
  }
}
