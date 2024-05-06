import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { NatsModule } from '@app/common/nats/nats.module';
import { WALLET_SERVICE } from '../constants';

@Module({
  imports: [NatsModule.register({ name: WALLET_SERVICE })],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule { }
