import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './setup/app.setup';
import { createWriteStream } from 'fs';
import { get } from 'http';
import { INestApplication } from '@nestjs/common';

const serverUrl = 'http://localhost:3003';

async function bootstrap() {
  const app: INestApplication = await NestFactory.create(AppModule);
  appSetup(app);
  await app.listen(process.env.PORT ?? 3003);

  if (process.env.NODE_ENV === 'development') {
    get(`${serverUrl}/api/swagger-ui-bundle.js`, function (response) {
      response.pipe(createWriteStream('swagger-static/swagger-ui-bundle.js'));
    });

    get(`${serverUrl}/api/swagger-ui-init.js`, function (response) {
      response.pipe(createWriteStream('swagger-static/swagger-ui-init.js'));
    });

    get(
      `${serverUrl}/api/swagger-ui-standalone-preset.js`,
      function (response) {
        response.pipe(
          createWriteStream('swagger-static/swagger-ui-standalone-preset.js'),
        );
      },
    );

    get(`${serverUrl}/api/swagger-ui.css`, function (response) {
      response.pipe(createWriteStream('swagger-static/swagger-ui.css'));
    });
  }
}
bootstrap();
