import { Injectable } from '@nestjs/common';
import { MeViewDto } from '../../api/view-dto/users.view-dto';
import { UsersRepository } from '../users.repository';
import { Types } from 'mongoose';
import { UserDocument } from '../../domain/user.entity';

@Injectable()
export class AuthQueryRepository {
  constructor(private usersRepository: UsersRepository) {}

  async me(userId: string): Promise<MeViewDto> {
    const user: UserDocument =
      await this.usersRepository.findOrNotFoundFail(userId);

    return MeViewDto.mapToView(user);
  }
}
