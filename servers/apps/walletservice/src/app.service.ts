import { Inject, Injectable } from '@nestjs/common';
import { AUTH_SERVICE } from './constants';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(@Inject(AUTH_SERVICE) private authClient: ClientProxy) {
  }

  getHello(): string {
    return 'Hello World!';
  }
}
