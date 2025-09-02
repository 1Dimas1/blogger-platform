import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from '../application/users.service';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { MeViewDto } from './view-dto/users.view-dto';
import { AuthService } from '../application/auth.service';
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

@Controller(Constants.PATH.AUTH)
export class AuthController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private authQueryRepository: AuthQueryRepository,
  ) {}

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  registration(@Body() body: CreateUserInputDto): Promise<void> {
    return this.usersService.registerUser(body);
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  registrationConfirmation(
    @Body() body: RegistrationConfirmationInputDto,
  ): Promise<void> {
    return this.usersService.confirmRegistration(body.code);
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  registrationEmailResending(
    @Body() body: RegistrationEmailResendingInputDto,
  ): Promise<void> {
    return this.usersService.resendConfirmationEmail(body.email);
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  passwordRecovery(@Body() body: PasswordRecoveryInputDto): Promise<void> {
    return this.usersService.initiatePasswordRecovery(body.email);
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  newPassword(@Body() body: NewPasswordInputDto): Promise<void> {
    return this.usersService.confirmPasswordRecovery(
      body.newPassword,
      body.recoveryCode,
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        loginOrEmail: { type: 'string', example: 'login123' },
        password: { type: 'string', example: 'superpassword' },
      },
    },
  })
  login(
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.login(user.id);
  }

  @ApiBearerAuth()
  @Get('me')
  @UseGuards(JwtAuthGuard)
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
