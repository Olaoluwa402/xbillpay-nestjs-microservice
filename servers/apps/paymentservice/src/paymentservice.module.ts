import { Module } from '@nestjs/common';
import { PaymentserviceController } from './paymentservice.controller';
import { PaymentserviceService } from './paymentservice.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { JwtStrategy, NatsModule, PrismaService, UtilsService } from '@app/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from "joi"
import { WALLET_SERVICE } from '@app/common/constants';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationOptions: Joi.object({
        PAYMENT_PORT: Joi.number().required(),
        NATS_URL: Joi.string().required(),
      })
    }), NatsModule.register({ name: WALLET_SERVICE })
  ],
  controllers: [PaymentserviceController],
  providers: [JwtStrategy, UtilsService, PrismaService, PaymentserviceService],
})
export class PaymentserviceModule {
  configureSwagger(app) {
    const options = new DocumentBuilder()
      .setTitle('bill payments')
      .setDescription('Handles bill payments')
      .setVersion('1.0')
      .addTag('bills')
      .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);
  }
}
