import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { API_SERVICE } from './constants';
import { RegisterUserDto } from './dto/registerUser.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtGuard, RefreshJwtGuard, GetUser, UtilsService } from '@app/common';
import type { User } from '@prisma/client';
import { LoginUserDto } from './dto/loginUser.dto';


@ApiTags('auth')
@Controller("auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private authService: AuthService, private utilService: UtilsService) { }

  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'register agents' })
  @Post("register")
  async register(@Body() dto: RegisterUserDto) {
    return this.utilService.createResponse("success", {
      status: HttpStatus.CREATED,
      data: await this.authService.registerUser(dto)
    })
  }

  @HttpCode(HttpStatus.OK)
  @Post("login")
  @ApiOperation({ summary: 'login agents' })
  async login(@Body() dto: LoginUserDto) {
    return this.utilService.createResponse("success", {
      status: HttpStatus.OK,
      data: await this.authService.loginUser(dto)
    })
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshJwtGuard)
  @Post('refresh-token')
  async refreshToken(@GetUser() user: User) {
    return this.utilService.createResponse("success", {
      status: HttpStatus.OK,
      data: await this.authService.refreshToken(user)
    })
  }

  @MessagePattern({ cmd: 'create_agent' })
  registerAgent(@Payload() data: any): string {
    this.logger.log(`${API_SERVICE}: ${data}`)
    return this.authService.registerAgent(data)
  }
}
