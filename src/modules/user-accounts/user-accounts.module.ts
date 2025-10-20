import { Module } from '@nestjs/common';
import { UsersController } from './api/users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/user.entity';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UsersExternalQueryRepository } from './infrastructure/external-query/users.external-query-repository';
import { UsersExternalService } from './application/users.external-service';
import { SecurityDevicesQueryRepository } from './infrastructure/query/security-devices.query-repository';
import { AuthQueryRepository } from './infrastructure/query/auth.query-repository';
import { AuthService } from './application/services/auth.service';
import { LocalStrategy } from './guards/local/local.strategy';
import { CryptoService } from './application/services/crypto.service';
import { JwtStrategy } from './guards/bearer/jwt.strategy';
import { AuthController } from './api/auth.controller';
import { PassportModule } from '@nestjs/passport';
import { Constants } from '../../core/constants';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from './constants/auth-tokens.inject-constants';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUserUseCase } from './application/usecases/admins/create-user.usecase';
import { DeleteUserUseCase } from './application/usecases/admins/delete-user.usecase';
import { UpdateUserUseCase } from './application/usecases/update-user.usecase';
import { RegisterUserUseCase } from './application/usecases/users/register-user.usecase';
import { ConfirmRegistrationUseCase } from './application/usecases/users/confirm-registration.usecase';
import { ResendConfirmationEmailUseCase } from './application/usecases/users/resend-confirmation-email.usecase';
import { InitiatePasswordRecoveryUseCase } from './application/usecases/users/initiate-password-recovery.usecase';
import { ConfirmPasswordRecoveryUseCase } from './application/usecases/users/confirm-password-recovery.usecase';
import { LoginUserUseCase } from './application/usecases/login-user.usecase';
import { GetUserByIdQueryHandler } from './application/queries/get-user-by-id.query';
import { UsersFactory } from './application/factories/users.factory';

const commandHandlers = [
  CreateUserUseCase,
  DeleteUserUseCase,
  UpdateUserUseCase,
  RegisterUserUseCase,
  ConfirmRegistrationUseCase,
  ResendConfirmationEmailUseCase,
  InitiatePasswordRecoveryUseCase,
  ConfirmPasswordRecoveryUseCase,
  LoginUserUseCase,
];

const queryHandlers = [GetUserByIdQueryHandler];

@Module({
  imports: [
    CqrsModule,
    PassportModule,
    JwtModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController, AuthController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    UsersRepository,
    UsersQueryRepository,
    SecurityDevicesQueryRepository,
    AuthQueryRepository,
    AuthService,
    {
      provide: ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (): JwtService => {
        return new JwtService({
          secret: Constants.JWT.ACCESS_TOKEN_SECRET,
          signOptions: { expiresIn: Constants.JWT.ACCESS_TOKEN_EXPIRATION },
        });
      },
      inject: [
        /*TODO: inject configService.*/
      ],
    },
    {
      provide: REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (): JwtService => {
        return new JwtService({
          secret: Constants.JWT.REFRESH_TOKEN_SECRET,
          signOptions: { expiresIn: Constants.JWT.REFRESH_TOKEN_EXPIRATION },
        });
      },
      inject: [
        /*TODO: inject configService.*/
      ],
    },
    LocalStrategy,
    CryptoService,
    JwtStrategy,
    UsersExternalQueryRepository,
    UsersExternalService,
    UsersFactory,
  ],
  exports: [JwtStrategy, UsersExternalQueryRepository, UsersExternalService],
})
export class UserAccountsModule {}
