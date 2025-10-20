import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MeViewDto } from './view-dto/users.view-dto';
import { CreateUserInputDto } from './input-dto/create-user.input-dto';
import { LocalAuthGuard } from '../guards/local/local-auth.guard';
import { ExtractUserFromRequest } from '../guards/decorators/param/extract-user-from-request.decorator';
import { Nullable, UserContextDto } from '../guards/dto/user-context.dto';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth.guard';
import { JwtOptionalAuthGuard } from '../guards/bearer/jwt-optional-auth.guard';
import { ExtractUserIfExistsFromRequest } from '../guards/decorators/param/extract-user-if-exists-from-request.decorator';
import { AuthQueryRepository } from '../infrastructure/query/auth.query-repository';
import { RegistrationConfirmationInputDto } from './input-dto/registration-confirmation.input-dto';
import { RegistrationEmailResendingInputDto } from './input-dto/registration-email-resending.input-dto';
import { PasswordRecoveryInputDto } from './input-dto/password-recovery.input-dto';
import { NewPasswordInputDto } from './input-dto/new-password.input-dto';
import { Constants } from '../../../core/constants';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '../application/usecases/users/register-user.usecase';
import { ConfirmRegistrationCommand } from '../application/usecases/users/confirm-registration.usecase';
import { ResendConfirmationEmailCommand } from '../application/usecases/users/resend-confirmation-email.usecase';
import { InitiatePasswordRecoveryCommand } from '../application/usecases/users/initiate-password-recovery.usecase';
import { ConfirmPasswordRecoveryCommand } from '../application/usecases/users/confirm-password-recovery.usecase';
import { LoginUserCommand } from '../application/usecases/login-user.usecase';

@ApiTags('Auth')
@Controller(Constants.PATH.AUTH)
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private authQueryRepository: AuthQueryRepository,
  ) {}

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      'Registration in the system. Email with confirmation code will be send to passed email address',
  })
  @ApiResponse({
    status: 204,
    description:
      'Input data is accepted. Email with confirmation code will be send to passed email address',
  })
  @ApiResponse({
    status: 400,
    description:
      'If the inputModel has incorrect values (in particular if the user with the given email or login already exists)',
  })
  @ApiResponse({
    status: 429,
    description: 'More than 5 attempts from one IP-address during 10 seconds',
  })
  registration(@Body() body: CreateUserInputDto): Promise<void> {
    return this.commandBus.execute(new RegisterUserCommand(body));
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Confirm registration' })
  @ApiResponse({
    status: 204,
    description: 'Email was verified. Account was activated',
  })
  @ApiResponse({
    status: 400,
    description:
      'If the confirmation code is incorrect, expired or already been applied',
  })
  @ApiResponse({
    status: 429,
    description: 'More than 5 attempts from one IP-address during 10 seconds',
  })
  registrationConfirmation(
    @Body() body: RegistrationConfirmationInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new ConfirmRegistrationCommand(body.code));
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Resend confirmation registration Email if user exists',
  })
  @ApiResponse({
    status: 204,
    description:
      'Input data is accepted.Email with confirmation code will be send to passed email address.Confirmation code should be inside link as query param, for example: https://some-front.com/confirm-registration?code=youtcodehere',
  })
  @ApiResponse({
    status: 400,
    description: 'If the inputModel has incorrect values',
  })
  @ApiResponse({
    status: 429,
    description: 'More than 5 attempts from one IP-address during 10 seconds',
  })
  registrationEmailResending(
    @Body() body: RegistrationEmailResendingInputDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new ResendConfirmationEmailCommand(body.email),
    );
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      'Password recovery via Email confirmation. Email should be sent with RecoveryCode inside',
  })
  @ApiResponse({
    status: 204,
    description:
      "Even if current email is not registered (for prevent user's email detection)",
  })
  @ApiResponse({
    status: 400,
    description:
      'If the inputModel has invalid email (for example 222^gmail.com)',
  })
  @ApiResponse({
    status: 429,
    description: 'More than 5 attempts from one IP-address during 10 seconds',
  })
  passwordRecovery(@Body() body: PasswordRecoveryInputDto): Promise<void> {
    return this.commandBus.execute(
      new InitiatePasswordRecoveryCommand(body.email),
    );
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Confirm Password recovery' })
  @ApiResponse({
    status: 204,
    description: 'If code is valid and new password is accepted',
  })
  @ApiResponse({
    status: 400,
    description:
      'If the inputModel has incorrect value (for incorrect password length) or RecoveryCode is incorrect or expired',
  })
  @ApiResponse({
    status: 429,
    description: 'More than 5 attempts from one IP-address during 10 seconds',
  })
  newPassword(@Body() body: NewPasswordInputDto): Promise<void> {
    return this.commandBus.execute(
      new ConfirmPasswordRecoveryCommand(body.newPassword, body.recoveryCode),
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Try login user to the system' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        loginOrEmail: { type: 'string', example: 'login123' },
        password: { type: 'string', example: 'superpassword' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns JWT accessToken (expired after 5 minutes) in body and JWT refreshToken in cookie (http-only, secure) (expired after 24 hours).',
  })
  @ApiResponse({
    status: 400,
    description: 'If the inputModel has incorrect values',
  })
  @ApiResponse({
    status: 401,
    description: 'If the password or login or email is wrong',
  })
  async login(
    @ExtractUserFromRequest() user: UserContextDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ accessToken: string }> {
    const tokens = await this.commandBus.execute<
      LoginUserCommand,
      { accessToken: string; refreshToken: string }
    >(new LoginUserCommand({ userId: user.id }));

    response.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: Constants.ENVIRONMENT === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return { accessToken: tokens.accessToken };
  }

  @ApiBearerAuth()
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get information about current user' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  me(@ExtractUserFromRequest() user: UserContextDto): Promise<MeViewDto> {
    return this.authQueryRepository.me(user.id);
  }

  @ApiBearerAuth()
  @Get('me-or-default')
  @UseGuards(JwtOptionalAuthGuard)
  async meOrDefault(
    @ExtractUserIfExistsFromRequest() user: UserContextDto,
  ): Promise<Nullable<MeViewDto>> {
    if (user) {
      return this.authQueryRepository.me(user.id);
    } else {
      return {
        login: 'anonymous',
        userId: null,
        email: null,
        firstName: null,
        lastName: null,
      };
    }
  }
}
