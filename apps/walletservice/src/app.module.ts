import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { WalletMangerModule } from './walletManager/walletManager.module';
import { NatsModule } from '@app/common/nats/nats.module';
import { AUTH_SERVICE } from "./constants"
import * as Joi from 'joi';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { JwtModule } from '@nestjs/jwt';


@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    validationOptions: Joi.object({
      PORT: Joi.number().required(),
      NATS_URL: Joi.string().required(),
    })
  }), NatsModule.register({ name: AUTH_SERVICE }), WalletMangerModule],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {
  configureSwagger(app) {
    const options = new DocumentBuilder()
      .setTitle('Wallet service')
      .setDescription('Manages agent wallets and wallet transactions.')
      .setVersion('1.0')
      .addTag('wallets')
      .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);
  }
}
