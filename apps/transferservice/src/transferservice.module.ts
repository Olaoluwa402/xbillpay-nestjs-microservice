import { Module } from '@nestjs/common';
import { TransferserviceController } from './transferservice.controller';
import { TransferserviceService } from './transferservice.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from "joi"
import { JwtStrategy, NatsModule } from '@app/common';
import { WALLET_SERVICE } from '@app/common/constants';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { UtilsService, PrismaService, DbQueryService } from '@app/common';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    validationOptions: Joi.object({
      TRANSFER_PORT: Joi.number().required(),
      NATS_URL: Joi.string().required(),
    })
  }), NatsModule.register({ name: WALLET_SERVICE })],
  controllers: [TransferserviceController],
  providers: [JwtStrategy, TransferserviceService, UtilsService, PrismaService],
})
export class TransferserviceModule {
  configureSwagger(app) {
    const options = new DocumentBuilder()
      .setTitle('Transfer service')
      .setDescription('Facilitates wallet-to-wallet transfers and others')
      .setVersion('1.0')
      .addTag('transfers')
      .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);
  }
}
