import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { API_SERVICE } from '../constants';
import { RegisterUserDto } from './dto/registerUser.dto';

@Controller("auth")
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(private userService: UserService) { }

  @Post("register")
  async register(@Body() dto: RegisterUserDto) {
    return await this.userService.registerUser(dto)
  }

  @Post("login")
  async login(@Body() dto: RegisterUserDto) {
    return await this.userService.loginUser(dto)
  }

  @MessagePattern({ cmd: 'create_agent' })
  registerAgent(@Payload() data: any): string {
    this.logger.log(`${API_SERVICE}: ${data}`)
    return this.userService.registerAgent(data)
  }
}
