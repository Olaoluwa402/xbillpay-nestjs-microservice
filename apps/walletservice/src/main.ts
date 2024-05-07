import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NatsService } from '@app/common/nats/nats.service';
const { WALLET_PORT } = process.env;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const natsService = app.get<NatsService>(NatsService)

  app.useGlobalPipes(new ValidationPipe()); //enable validation globally
  app.connectMicroservice(natsService.getOptions());

  const appModule = new AppModule();
  appModule.configureSwagger(app);

  await app.startAllMicroservices();

  const APP_PORT = WALLET_PORT || 9001;
  await app.listen(APP_PORT, () =>
    console.log(`App running on port ${APP_PORT}`),
  );
}
bootstrap();
