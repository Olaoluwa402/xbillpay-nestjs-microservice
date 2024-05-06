import { ConflictException, ForbiddenException, HttpStatus, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { WALLET_SERVICE } from './constants';
import { RegisterUserDto } from './dto/registerUser.dto';
import { UserService } from './user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService, UtilsService, } from '@app/common';
import { User } from '@prisma/client';
import { IAuthTokens } from './interface/token.interface';
import * as argon2 from 'argon2';
import { lastValueFrom } from 'rxjs';
import { LoginUserDto } from './dto/loginUser.dto';


@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @Inject(WALLET_SERVICE) private walletClient: ClientProxy,
    private readonly userService: UserService,
    private readonly jwt: JwtService,
    private config: ConfigService,
    private prisma: PrismaService,
    private utilService: UtilsService
  ) { }

  async registerUser(data: RegisterUserDto): Promise<any> {
    //check if user exist
    const userExist = await this.getUserByEmail(data.email);

    if (userExist) {
      throw new ConflictException("User with email already registered")
    }

    //generate hash for password
    const hash = await argon2.hash(data.password);

    //create user
    const createdUser = await this.prisma.user.create({
      data: { firstName: data.firstName, lastName: data.lastName, phoneNumber: data.phoneNumber, email: data.email, password: hash }
    })

    // send create wallet event to wallet service
    await lastValueFrom(this.walletClient.emit({ cmd: "create_wallet" }, { userId: createdUser.id }))

    //generate auth tokens
    const tokens = await this.signToken(createdUser.id, createdUser.email);

    const record = {
      ...tokens,
      user: this.utilService.serializeUser(createdUser)
    }

    return record
  }

  async getUserByEmail(email: string, includeArg?: Record<string, any>): Promise<User | null> {
    let include = {}
    if (include) {
      include = { include: includeArg }
    }
    const user = await this.prisma.user.findFirst({ where: { email: email }, ...include })
    return user;
  }

  async loginUser(data: LoginUserDto): Promise<any> {
    const user = await this.getUserByEmail(data.email, { wallet: true })
    if (!user) {
      throw new NotFoundException("User not found, please register first")
    }

    //compare password
    const pwMatches = await argon2.verify(user.password, data.password);

    //if password does not exist throw exception
    if (!pwMatches) {
      throw new ForbiddenException('Credentials not correct');
    }

    const tokens = await this.signToken(user.id, user.email);
    const record = {
      ...tokens,
      user: this.utilService.serializeUser(user)
    }

    return record
  }

  //refresh token
  async refreshToken(user: User) {

    const tokens = await this.signToken(user.id, user.email);

    const record = {
      ...tokens,
      user: this.utilService.serializeUser(user)
    }

    return record
  }

  registerAgent(data: any): any {
    this.logger.log(`${WALLET_SERVICE}: ${data}`)
    return data;
  }


  //sign token handler
  async signToken(userId: number, email: string): Promise<IAuthTokens> {
    const payload = {
      sub: userId,
      email,
    };

    const secret = this.config.get('JWT_SECRET');
    const token_exp = this.config.get('ACCESS_TOKEN_EXPIRY');
    const refresh_token_exp = this.config.get('REFRESH_TOKEN_EXPIRY');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: `${token_exp}d`,
      secret,
    });

    const refresh_token = await this.jwt.signAsync(payload, {
      expiresIn: `${refresh_token_exp}d`,
      secret,
    });

    return {
      access_token: token,
      refresh_token,
      refresh_token_expiry: this.utilService.getDate(refresh_token_exp),
    }
  }
}
