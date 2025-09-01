import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../domain/user.entity';
import { UsersRepository } from '../infrastructure/users.repository';
import { Types } from 'mongoose';

@Injectable()
export class UsersExternalService {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private usersRepository: UsersRepository,
  ) {}

  async makeUserAsSpammer(userId: Types.ObjectId) {
    const user: UserDocument =
      await this.usersRepository.findOrNotFoundFail(userId);

    // user.makeSpammer();

    await this.usersRepository.save(user);
  }
}
