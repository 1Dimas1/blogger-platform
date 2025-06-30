import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { CoreModule } from './core/core.module';
import { BloggerPlatformModule } from './modules/blogger-platform/blogger-platform.module';
import { SETTINGS } from './core/settings';

@Module({
  imports: [
    MongooseModule.forRoot(SETTINGS.MONGO_URL!, { dbName: SETTINGS.DB_NAME }),
    UserAccountsModule,
    CoreModule,
    BloggerPlatformModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
