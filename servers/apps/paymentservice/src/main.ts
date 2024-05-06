import { NestFactory } from '@nestjs/core';
import { PaymentserviceModule } from './paymentservice.module';
import { NatsService } from '@app/common';
import { ValidationPipe } from '@nestjs/common';
const { PAYMENT_PORT } = process.env

async function bootstrap() {
  const app = await NestFactory.create(PaymentserviceModule);
  const natsService = app.get<NatsService>(NatsService)

  app.useGlobalPipes(new ValidationPipe());
  app.connectMicroservice(natsService.getOptions());

  const appModule = new PaymentserviceModule();
  appModule.configureSwagger(app);

  await app.startAllMicroservices();

  const APP_PORT = PAYMENT_PORT || 9003;
  await app.listen(APP_PORT, () =>
    console.log(`App running on port ${APP_PORT}`),
  );
}
bootstrap();
