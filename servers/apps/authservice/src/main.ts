import { NestFactory } from '@nestjs/core';
import { AppModule } from './auth.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NatsService } from '@app/common/nats/nats.service';
import { ValidationPipe } from '@nestjs/common';
const { AUTH_PORT } = process.env;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const natsService = app.get<NatsService>(NatsService)

  app.useGlobalPipes(new ValidationPipe());
  app.connectMicroservice(natsService.getOptions());

  await app.startAllMicroservices();

  // Call configureSwagger method from AppModule
  const appModule = new AppModule();
  appModule.configureSwagger(app);

  const APP_PORT = AUTH_PORT || 9000;
  await app.listen(APP_PORT, () =>
    console.log(`App running on port ${APP_PORT}`),
  );
}
bootstrap();
