import { Module } from '@nestjs/common';
import { UsersController } from './api/users.controller';
import { UsersService } from './application/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/user.entity';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { NotificationsModule } from '../notifications/notifications.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UsersExternalQueryRepository } from './infrastructure/external-query/users.external-query-repository';
import { UsersExternalService } from './application/users.external-service';
import { SecurityDevicesQueryRepository } from './infrastructure/query/security-devices.query-repository';
import { AuthQueryRepository } from './infrastructure/query/auth.query-repository';
import { AuthService } from './application/auth.service';
import { LocalStrategy } from './guards/local/local.strategy';
import { CryptoService } from './application/crypto.service';
import { JwtStrategy } from './guards/bearer/jwt.strategy';
import { AuthController } from './api/auth.controller';
import { PassportModule } from '@nestjs/passport';
import { Constants } from '../../core/constants';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from './constants/auth-tokens.inject-constants';

@Module({
  imports: [
    PassportModule,
    JwtModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    NotificationsModule,
  ],
  controllers: [UsersController, AuthController],
  providers: [
    UsersService,
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
  ],
  exports: [JwtStrategy, UsersExternalQueryRepository, UsersExternalService],
})
export class UserAccountsModule {}
