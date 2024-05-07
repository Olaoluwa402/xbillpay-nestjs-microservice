import { WALLET_SERVICE } from '@app/common/constants';
import { BadRequestException, ConflictException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Prisma, TransactionType, User } from '@prisma/client';
import { CompleteWalletFundingDto, FundWalletDto, WalletToWalletTransferDto } from './dto/fund-wallet.dto';
import { PrismaService, UtilsService } from '@app/common';
import { IPaystackFundingDetail } from './interface';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';


@Injectable()
export class TransferserviceService {
  constructor(
    @Inject(WALLET_SERVICE) private walletClient: ClientProxy,
    private utilService: UtilsService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) { }

  async getTransactions(user: User,) {
    return await this.prisma.transaction.findMany({
      where: {
        wallet: { agentId: user.id }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  async initiateWalletFunding(user: User, dto: FundWalletDto): Promise<any> {
    const { firstName, lastName, email, } = user;

    const fundingDetail = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      amount: dto.amount * 100,
      metadata: {
        first_name: firstName,
        last_name: lastName,
        email: email,
      },
    };

    const response = await this.payStackInitTrans(fundingDetail)
    if (response.status == false) {
      throw new BadRequestException("Something went wrong with funding, pls try again")
    }

    return response.data
  }

  async completeWalletFunding(user: User, dto: CompleteWalletFundingDto): Promise<any> {
    const { paystackReference } = dto

    const response = await this.confirmRef(paystackReference)
    if (response.status === false) {
      throw new BadRequestException("Not verified, invalid credentials")
    }

    const { currency, reference, amount, metadata } = response.data;

    // fund wallet
    const walletResponse = await lastValueFrom(this.walletClient.send({ cmd: "fund_wallet" }, { userId: user.id, amount: amount / 100 }))

    if (!walletResponse.data) {
      throw new BadRequestException("Something went wrong with wallet funding")
    }

    //create transaction
    await this.prisma.transaction.create({
      data: {
        amount: +amount,
        walletId: walletResponse.data.id,
        type: TransactionType.DEPOSIT,
        reference: reference
      }
    })

    return "Wallet funding successful"
  }

  async payStackInitTrans(detail: IPaystackFundingDetail) {
    const baseEndpoint = "https://api.paystack.co/transaction/initialize";
    const apiKey = `Bearer ${this.configService.get<string>('PAYSTACK_KEY')}`
    const method = 'POST'
    const bodyData = JSON.stringify(detail)
    const extraHeaderInfo = { "cache-control": "no-cache" }


    const data = await this.utilService.fetchApi(apiKey, baseEndpoint, method, bodyData, extraHeaderInfo)
    return data
  }

  async confirmRef(ref: string) {
    const baseEndpoint = `https://api.paystack.co/transaction/verify/${ref}`;
    const apiKey = `Bearer ${this.configService.get<string>('PAYSTACK_KEY')}`
    const method = 'GET'
    const bodyData = null
    const extraHeaderInfo = { "cache-control": "no-cache" }


    const data = await this.utilService.fetchApi(apiKey, baseEndpoint, method, bodyData, extraHeaderInfo)
    return data
  }

  async walletToWalletTransfer(user: User, dto: WalletToWalletTransferDto): Promise<any> {

    const walletResponse = await lastValueFrom(this.walletClient.send(
      { cmd: "transfer_to_wallet" },
      { senderId: user.id, receiverId: dto.receiverId, amount: dto.amount }))

    if (!walletResponse.data) {
      throw new BadRequestException("Something went wrong with wallet funding")
    }

    console.log(walletResponse.data, "walletResponse.data")

    await this.prisma.transaction.create({
      data: {
        amount: +dto.amount,
        walletId: walletResponse.data.receiverWallet,
        type: TransactionType.TRANSFER,
        extralInfo: walletResponse.data.extraInfo as Prisma.JsonObject
      }
    })

    await this.prisma.transaction.create({
      data: {
        amount: +dto.amount,
        walletId: walletResponse.data.senderWallet,
        type: TransactionType.TRANSFER,
        extralInfo: walletResponse.data.extraInfo as Prisma.JsonObject
      }
    })

    return "Transfer successful"
  }
}
