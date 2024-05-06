import { NestFactory } from '@nestjs/core';
import { TransferserviceModule } from './transferservice.module';
import { ValidationPipe } from '@nestjs/common';
import { NatsService } from '@app/common';
const { TRANSFER_PORT } = process.env

async function bootstrap() {
  const app = await NestFactory.create(TransferserviceModule);
  const natsService = app.get<NatsService>(NatsService)

  app.useGlobalPipes(new ValidationPipe());
  app.connectMicroservice(natsService.getOptions());

  const appModule = new TransferserviceModule();
  appModule.configureSwagger(app);

  await app.startAllMicroservices();

  const APP_PORT = TRANSFER_PORT || 9002;
  await app.listen(APP_PORT, () =>
    console.log(`App running on port ${APP_PORT}`),
  );
}
bootstrap();
