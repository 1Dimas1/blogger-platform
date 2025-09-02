import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateUserDto } from '../dto/update-user.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { UsersRepository } from '../infrastructure/users.repository';
import { User, UserDocument, UserModelType } from '../domain/user.entity';
import { CryptoService } from './crypto.service';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from '../../notifications/email.service';
import { Constants } from '../../../core/constants';

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

    const userWithTheSameEmailIsExist: boolean =
      await this.usersRepository.emailIsExist(dto.email);

    if (userWithTheSameEmailIsExist) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User with the same email already exists',
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

  async updateUser(id: string, dto: UpdateUserDto): Promise<string> {
    const user: UserDocument =
      await this.usersRepository.findOrNotFoundFail(id);

    user.update(dto);

    await this.usersRepository.save(user);

    return user._id.toString();
  }

  async deleteUser(id: string): Promise<void> {
    const user: UserDocument =
      await this.usersRepository.findOrNotFoundFail(id);

    user.makeDeleted();

    await this.usersRepository.save(user);
  }

  async registerUser(dto: CreateUserDto) {
    const createdUserId: string = await this.createUser(dto);

    const confirmCode: string = uuidv4();
    const expirationDate: Date =
      Constants.EMAIL_CONFIRMATION_CODE_EXP_DATE_24_H;

    const user: UserDocument =
      await this.usersRepository.findOrNotFoundFail(createdUserId);

    user.setConfirmationCode(confirmCode, expirationDate);
    await this.usersRepository.save(user);

    this.emailService
      .sendConfirmationEmail(user.email, confirmCode)
      .catch(console.error);
  }

  async confirmRegistration(code: string): Promise<void> {
    const user: UserDocument | null =
      await this.usersRepository.findByConfirmationCode(code);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message:
          'Confirmation code is incorrect, expired or already been applied',
      });
    }

    if (user.emailConfirmation.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email already confirmed',
      });
    }

    if (user.isEmailConfirmationExpired()) {
      throw new DomainException({
        code: DomainExceptionCode.ConfirmationCodeExpired,
        message: 'Confirmation code expired',
      });
    }

    user.confirmEmail();
    await this.usersRepository.save(user);
  }

  async resendConfirmationEmail(email: string): Promise<void> {
    const user: UserDocument | null =
      await this.usersRepository.findByEmail(email);

    if (!user) {
      return;
    }

    if (user.emailConfirmation.isConfirmed) {
      return;
    }

    const confirmCode: string = uuidv4();
    const expirationDate: Date =
      Constants.EMAIL_CONFIRMATION_CODE_EXP_DATE_24_H;

    user.setConfirmationCode(confirmCode, expirationDate);
    await this.usersRepository.save(user);

    this.emailService
      .sendConfirmationEmail(user.email, confirmCode)
      .catch(console.error);
  }

  async initiatePasswordRecovery(email: string): Promise<void> {
    const user: UserDocument | null =
      await this.usersRepository.findByEmail(email);

    if (!user) {
      return;
    }

    const recoveryCode: string = uuidv4();
    const expirationDate: Date = Constants.PASSWORD_RECOVERY_CODE_EXP_DATE_1_H;

    user.setPasswordRecoveryCode(recoveryCode, expirationDate);
    await this.usersRepository.save(user);

    this.emailService
      .sendPasswordRecoveryEmail(user.email, recoveryCode)
      .catch(console.error);
  }

  async confirmPasswordRecovery(
    newPassword: string,
    recoveryCode: string,
  ): Promise<void> {
    const user: UserDocument | null =
      await this.usersRepository.findByRecoveryCode(recoveryCode);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Recovery code is incorrect or expired',
      });
    }

    if (user.isPasswordRecoveryExpired()) {
      throw new DomainException({
        code: DomainExceptionCode.PasswordRecoveryCodeExpired,
        message: 'Recovery code expired',
      });
    }

    const newPasswordHash: string =
      await this.cryptoService.createPasswordHash(newPassword);
    user.updatePassword(newPasswordHash);
    await this.usersRepository.save(user);
  }
}
