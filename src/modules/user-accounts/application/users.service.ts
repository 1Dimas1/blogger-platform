import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateUserDto } from '../dto/update-user.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { UsersRepository } from '../infrastructure/users.repository';
import { User, UserDocument, UserModelType } from '../domain/user.entity';
import { Types } from 'mongoose';
import { CryptoService } from './crypto.service';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from '../../notifications/email.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private usersRepository: UsersRepository,
    private emailService: EmailService,
    private cryptoService: CryptoService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<string> {
    const userWithTheSameLoginIsExist: boolean =
      await this.usersRepository.loginIsExist(dto.login);

    if (userWithTheSameLoginIsExist) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User with the same login already exists',
      });
    }

    const passwordHash: string = await this.cryptoService.createPasswordHash(
      dto.password,
    );

    const user: UserDocument = this.UserModel.createInstance({
      email: dto.email,
      login: dto.login,
      passwordHash: passwordHash,
    });

    await this.usersRepository.save(user);

    return user._id.toString();
  }

  async updateUser(id: Types.ObjectId, dto: UpdateUserDto): Promise<string> {
    const user: UserDocument =
      await this.usersRepository.findOrNotFoundFail(id);

    user.update(dto);

    await this.usersRepository.save(user);

    return user._id.toString();
  }

  async deleteUser(id: Types.ObjectId): Promise<void> {
    const user: UserDocument =
      await this.usersRepository.findOrNotFoundFail(id);

    user.makeDeleted();

    await this.usersRepository.save(user);
  }

  async registerUser(dto: CreateUserDto) {
    const createdUserId: string = await this.createUser(dto);

    const confirmCode: string = uuidv4();

    const user: UserDocument = await this.usersRepository.findOrNotFoundFail(
      new Types.ObjectId(createdUserId),
    );

    user.setConfirmationCode(confirmCode);
    await this.usersRepository.save(user);

    this.emailService
      .sendConfirmationEmail(user.email, confirmCode)
      .catch(console.error);
  }
}
