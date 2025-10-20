import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { UserDocument } from '../../../domain/user.entity';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { v4 as uuidv4 } from 'uuid';
import { Constants } from '../../../../../core/constants';
import { ConfirmationEmailResendRequestedEvent } from '../../../domain/events/confirmation-email-resend-requested.event';

export class ResendConfirmationEmailCommand {
  constructor(public email: string) {}
}

@CommandHandler(ResendConfirmationEmailCommand)
export class ResendConfirmationEmailUseCase
  implements ICommandHandler<ResendConfirmationEmailCommand, void>
{
  constructor(
    private eventBus: EventBus,
    private usersRepository: UsersRepository,
  ) {}

  async execute({ email }: ResendConfirmationEmailCommand): Promise<void> {
    const user: UserDocument | null =
      await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email Invalid',
        extensions: [
          {
            message: 'Invalid email address',
            field: 'email',
          },
        ],
      });
    }

    if (user.emailConfirmation.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email already confirmed',
        extensions: [
          {
            message: 'Email already confirmed',
            field: 'email',
          },
        ],
      });
    }

    const confirmCode: string = uuidv4();
    const expirationDate: Date =
      Constants.EMAIL_CONFIRMATION_CODE_EXP_DATE_24_H;

    user.setConfirmationCode(confirmCode, expirationDate);
    await this.usersRepository.save(user);

    this.eventBus.publish(
      new ConfirmationEmailResendRequestedEvent(user.email, confirmCode),
    );
  }
}
