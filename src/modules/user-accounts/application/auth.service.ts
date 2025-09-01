import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { JwtService } from '@nestjs/jwt';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { CryptoService } from './crypto.service';
import { UserDocument } from '../domain/user.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
    private cryptoService: CryptoService,
  ) {}

  async validateUser(
    login: string,
    password: string,
  ): Promise<UserContextDto | null> {
    const user: UserDocument | null =
      await this.usersRepository.findByLogin(login);
    if (!user) {
      return null;
    }

    if (!user.emailConfirmation.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.EmailNotConfirmed,
        message: 'Email is not confirmed',
      });
    }

    const isPasswordValid: boolean = await this.cryptoService.comparePasswords({
      password,
      hash: user.passwordHash,
    });

    if (!isPasswordValid) {
      return null;
    }

    return { id: user.id.toString() };
  }

  async login(userId: string): Promise<{
    accessToken: string;
  }> {
    const accessToken: string = this.jwtService.sign({
      id: userId,
    } as UserContextDto);

    return {
      accessToken,
    };
  }
}
