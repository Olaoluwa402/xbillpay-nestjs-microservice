import { Module } from '@nestjs/common';
import { ConfigModule } from "@nestjs/config";
import { UserModule } from './user/user.module';
import { NatsModule } from '@app/common/nats/nats.module';
import { WALLET_SERVICE } from './constants';
import * as Joi from "joi"
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from './user/user.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaService, UtilsService, JwtStrategy, RefreshJwtStrategy } from '@app/common';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    validationOptions: Joi.object({
      MYSQL_URL: Joi.string().required()
    })
  }), JwtModule.register({}), NatsModule.register({ name: WALLET_SERVICE }), UserModule],
  controllers: [AuthController],
  providers: [JwtStrategy, RefreshJwtStrategy, AuthService, UserService, JwtService, PrismaService, UtilsService],
  exports: [AuthService]
})
export class AppModule {
  configureSwagger(app) {
    const options = new DocumentBuilder()
      .setTitle('Auth service')
      .setDescription('Everything authentication and authorization')
      .setVersion('1.0')
      .addTag('auth')
      .addTag('users')
      .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);
  }
}
