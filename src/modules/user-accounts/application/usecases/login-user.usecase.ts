import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../constants/auth-tokens.inject-constants';
import { JwtService } from '@nestjs/jwt';
import { SecurityDevicesRepository } from '../../infrastructure/security-devices.repository';
import { SecurityDeviceDocument } from '../../domain/security-device.entity';
import { v4 as uuidv4 } from 'uuid';
import { Types } from 'mongoose';
import { CreateSecurityDeviceDomainDto } from '../../domain/dto/create-security-device.domain.dto';
import { UserAccountsConfig } from '../../config/user-accounts.config';
import { calculateExpirationDate } from '../../utils/calculate-expiration-date.utility';
import { SecurityDevicesFactory } from '../factories/security-devices.factory';

export class LoginUserCommand {
  constructor(
    public dto: {
      userId: string;
      ip: string;
      deviceTitle: string;
    },
  ) {}
}

// TODO refactor LoginUseCase
@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,

    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,

    private securityDevicesRepository: SecurityDevicesRepository,

    private userAccountsConfig: UserAccountsConfig,

    private securityDevicesFactory: SecurityDevicesFactory,
  ) {}

  async execute({ dto }: LoginUserCommand): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const deviceId: string = uuidv4();

    const refreshTokenTtl: string =
      this.userAccountsConfig.refreshTokenExpireIn;
    const expirationDate: Date = calculateExpirationDate(refreshTokenTtl);

    const deviceDto: CreateSecurityDeviceDomainDto = {
      userId: new Types.ObjectId(dto.userId),
      deviceId,
      ip: dto.ip,
      title: dto.deviceTitle,
      expirationDate,
    };

    const device: SecurityDeviceDocument =
      this.securityDevicesFactory.create(deviceDto);
    await this.securityDevicesRepository.save(device);

    const accessToken: string = this.accessTokenContext.sign({
      userId: dto.userId,
    });

    const refreshToken: string = this.refreshTokenContext.sign({
      userId: dto.userId,
      deviceId,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
