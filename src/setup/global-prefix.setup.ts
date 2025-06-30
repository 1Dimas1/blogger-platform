import { INestApplication } from '@nestjs/common';
import { SETTINGS } from '../core/settings';

export function globalPrefixSetup(app: INestApplication) {
  app.setGlobalPrefix(SETTINGS.GLOBAL_PREFIX);
}
