import { configModule } from './config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { CoreModule } from './core/core.module';
import { BloggerPlatformModule } from './modules/blogger-platform/blogger-platform.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TestingModule } from './modules/testing/testing.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AllHttpExceptionsFilter } from './core/exceptions/filters/all-exceptions.filter';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { DomainHttpExceptionsFilter } from './core/exceptions/filters/domain-exceptions.filter';
import { Constants } from './core/constants';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'swagger-static'),
      serveRoot: Constants.ENVIRONMENT === 'development' ? '/' : '/api',
    }),
    MongooseModule.forRoot(Constants.MONGO_URL!, {
      dbName: Constants.DB_NAME,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 5,
      },
    ]),
    CqrsModule.forRoot(),
    UserAccountsModule,
    CoreModule,
    BloggerPlatformModule,
    TestingModule,
    NotificationsModule,
    configModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllHttpExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: DomainHttpExceptionsFilter,
    },
  ],
})
export class AppModule {}
