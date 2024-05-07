import { Module } from '@nestjs/common';
import { WalletService } from './walletManager.service';
import { WalletController } from './walletManager.controller';
import { NatsModule } from '@app/common/nats/nats.module';
import { AUTH_SERVICE } from '../constants';
import { PrismaService } from '@app/common';
import { UtilsService } from '@app/common';
import { JwtStrategy } from '@app/common';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({}),
    NatsModule.register({ name: AUTH_SERVICE }),
  ],
  controllers: [WalletController],
  providers: [JwtStrategy, PrismaService, WalletService, UtilsService],
})
export class WalletMangerModule { }
