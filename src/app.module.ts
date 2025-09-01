import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { CoreModule } from './core/core.module';
import { BloggerPlatformModule } from './modules/blogger-platform/blogger-platform.module';
import { Constants } from './core/constants';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TestingModule } from './modules/testing/testing.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AllHttpExceptionsFilter } from './core/exceptions/filters/all-exceptions.filter';
import { APP_FILTER } from '@nestjs/core';
import { DomainHttpExceptionsFilter } from './core/exceptions/filters/domain-exceptions.filter';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'swagger-static'),
      serveRoot: process.env.NODE_ENV === 'development' ? '/' : '/api',
    }),
    MongooseModule.forRoot(Constants.MONGO_URL!, { dbName: Constants.DB_NAME }),
    UserAccountsModule,
    CoreModule,
    BloggerPlatformModule,
    TestingModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
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
