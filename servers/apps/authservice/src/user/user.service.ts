import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { WALLET_SERVICE } from '../constants';
import { RegisterUserDto } from './dto/registerUser.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(@Inject(WALLET_SERVICE) private apiClient: ClientProxy) { }

  async registerUser(data: RegisterUserDto): Promise<any> {
    return data;
  }

  async loginUser(data: RegisterUserDto): Promise<any> {
    return data;
  }

  registerAgent(data: any): any {
    this.logger.log(`${WALLET_SERVICE}: ${data}`)
    return data;
  }
}
