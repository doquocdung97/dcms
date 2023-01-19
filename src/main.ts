import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Config } from './Constants';
import { NestApplicationOptions } from '@nestjs/common';
import { LoggerHelper } from 'core/common';
let logger = new LoggerHelper('Main');
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new LoggerHelper('Nest'),
  });
  let port = Config.PORT;
  await app.listen(port);
  logger.info(`App listening on port: ${port}`);
}
logger.info(`Start App`);
bootstrap();
