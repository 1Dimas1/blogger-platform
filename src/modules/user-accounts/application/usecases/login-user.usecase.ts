import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../constants/auth-tokens.inject-constants';
import { JwtService } from '@nestjs/jwt';
import { SecurityDevicesRepository } from '../../infrastructure/security-devices.repository';
import {
  SecurityDevice,
  SecurityDeviceDocument,
} from '../../domain/security-device.entity';
import { v4 as uuidv4 } from 'uuid';
import { Types } from 'mongoose';
import { CreateSecurityDeviceDomainDto } from '../../domain/dto/create-security-device.domain.dto';
import { Constants } from '../../../../core/constants';

export class LoginUserCommand {
  constructor(
    public dto: {
      userId: string;
      ip: string;
      userAgent: string;
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
  ) {}

  async execute({ dto }: LoginUserCommand): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const deviceId: string = uuidv4();

    const refreshTokenTtl: string =
      Constants.JWT.REFRESH_TOKEN_EXPIRATION || '20s';
    const expirationDate: Date = this.calculateExpirationDate(refreshTokenTtl);

    const deviceDto: CreateSecurityDeviceDomainDto = {
      userId: new Types.ObjectId(dto.userId),
      deviceId,
      ip: dto.ip,
      title: this.parseUserAgent(dto.userAgent),
      expirationDate,
    };

    const device: SecurityDeviceDocument =
      SecurityDevice.createInstance(deviceDto);
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

  private parseUserAgent(userAgent: string): string {
    if (!userAgent) {
      return 'Unknown device';
    }
    const match: RegExpMatchArray | null = userAgent.match(
      /(Chrome|Firefox|Safari|Edge|Opera)\/(\d+)/i,
    );
    if (match) {
      return `${match[1]} ${match[2]}`;
    }
    return userAgent.substring(0, 50);
  }

  private calculateExpirationDate(ttl: string): Date {
    const match: RegExpMatchArray | null = ttl.match(/^(\d+)([smhd])$/);
    if (!match) {
      return new Date(Date.now() + 20 * 1000);
    }

    const value: number = parseInt(match[1], 10);
    const unit: string = match[2];

    let milliseconds: number;
    switch (unit) {
      case 's':
        milliseconds = value * 1000;
        break;
      case 'm':
        milliseconds = value * 60 * 1000;
        break;
      case 'h':
        milliseconds = value * 60 * 60 * 1000;
        break;
      case 'd':
        milliseconds = value * 24 * 60 * 60 * 1000;
        break;
      default:
        milliseconds = 20 * 1000;
    }

    return new Date(Date.now() + milliseconds);
  }
}
