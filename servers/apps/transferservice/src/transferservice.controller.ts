import { Body, Controller, Get, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { TransferserviceService } from './transferservice.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser, JwtGuard, Roles, RolesGuard, UtilsService } from '@app/common';
import { Role, User } from '@prisma/client';
import { CompleteWalletFundingDto, FundWalletDto, WalletToWalletTransferDto } from './dto/fund-wallet.dto';

@ApiTags('transfers')
@Controller("transfers")
export class TransferserviceController {
  constructor(
    private transferserviceService: TransferserviceService,
    private utilService: UtilsService
  ) { }

  @UseGuards(JwtGuard, RolesGuard)
  @Get()
  @Roles(Role.AGENT)
  @ApiOperation({ summary: 'get transactions' })
  async getTransactions(@GetUser() user: User): Promise<any> {
    return this.utilService.createResponse("success", {
      status: HttpStatus.OK,
      data: await this.transferserviceService.getTransactions(user)
    })
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Post("initiate-wallet-funding")
  @Roles(Role.AGENT)
  @ApiOperation({ summary: 'initiate wallet funding' })
  async initiateWalletFunding(@GetUser() user: User, @Body() dto: FundWalletDto): Promise<any> {
    return this.utilService.createResponse("success", {
      status: HttpStatus.OK,
      data: await this.transferserviceService.initiateWalletFunding(user, dto)
    })
  }



  @UseGuards(JwtGuard, RolesGuard)
  @Post("complete-wallet-funding")
  @Roles(Role.AGENT)
  @ApiOperation({ summary: 'complete wallet funding' })
  async completeWalletFunding(@GetUser() user: User, @Body() dto: CompleteWalletFundingDto): Promise<any> {
    return this.utilService.createResponse("success", {
      status: HttpStatus.OK,
      data: await this.transferserviceService.completeWalletFunding(user, dto)
    })
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Post("wallet-transfer")
  @Roles(Role.AGENT)
  @ApiOperation({ summary: 'wallet to wallet transfer' })
  async walletToWalletTransfer(@GetUser() user: User, @Body() dto: WalletToWalletTransferDto): Promise<any> {
    return this.utilService.createResponse("success", {
      status: HttpStatus.OK,
      data: await this.transferserviceService.walletToWalletTransfer(user, dto)
    })
  }
} 
