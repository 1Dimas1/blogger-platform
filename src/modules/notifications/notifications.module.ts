import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { EmailManager } from './email.manager';
import { EmailAdapter } from './email.adapter';
import { EmailTemplateManager } from './email-template.manager';
import { GmailOAuthManager } from './gmail-oauth.manager';
import { GmailOAuthAdapter } from './gmail-oauth.adapter';

@Module({
  imports: [ConfigModule],
  providers: [
    EmailService,
    EmailManager,
    EmailAdapter,
    EmailTemplateManager,
    GmailOAuthManager,
    GmailOAuthAdapter,
  ],
  exports: [EmailService],
})
export class NotificationsModule {}
