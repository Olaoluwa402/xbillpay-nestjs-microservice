import { ConflictException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateWalletDto, GetWalletDto, UpdateWalletBalanceDto, WalletToWalletTransferDto } from './dto/wallet.dto';
import { AUTH_SERVICE } from '../constants';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from "rxjs"
import { PrismaService } from '@app/common';
import { Prisma, PrismaClient, User } from '@prisma/client';
import { UtilsService } from '@app/common';
import { FundWalletDto } from './dto/wallet.dto';

@Injectable()
export class WalletService {
  constructor(
    @Inject(AUTH_SERVICE) private authClient: ClientProxy,
    private prisma: PrismaService,
    private utilService: UtilsService
  ) {
  }

  async createWallet(dto: CreateWalletDto) {
    const wallet = await this.findWalletByUserId(dto.userId)
    if (!wallet) {
      return await this.prisma.wallet.create({
        data: {
          agentId: dto.userId
        }
      })
    }
  }

  async fundWallet(dto: FundWalletDto) {
    // Begin transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      const wallet = await this.prisma.wallet.findFirst({ where: { agentId: dto.userId } })
      if (!wallet) {
        return null
      }
      // Update wallet balance
      const update = await prisma.wallet.update({
        where: {
          agentId: dto.userId,
        },
        data: {
          balance: { increment: +dto.amount },
        },
      });

      return update;
    });
    return result;
  }

  async walletToWalletTransfer(data: WalletToWalletTransferDto) {
    const result = await this.prisma.$transaction(async (prisma) => {
      const receiver = await this.findWalletByUserId(data.receiverId, prisma)
      if (!receiver) {
        return null
      }

      const sender = await this.findWalletByUserId(data.senderId, prisma)
      if (!sender) {
        return null
      }

      const wallet = await this.prisma.wallet.findFirst({ where: { agentId: data.receiverId } })
      if (!wallet) {
        return null
      }

      // Update receiver wallet balance
      const receiverWallet = await prisma.wallet.update({
        where: {
          agentId: data.receiverId,
        },
        data: {
          balance: { increment: +data.amount },
        },
      });

      // Update sender wallet balance
      const senderWallet = await prisma.wallet.update({
        where: {
          agentId: data.senderId,
        },
        data: {
          balance: { decrement: +data.amount },
        },
      });

      return {
        senderWallet: senderWallet.id,
        receiverWallet: receiverWallet.id,
        extraInfo: {
          receiver: {
            id: receiver.agentId,
            firstName: receiver.agent.firstName,
            lastName: receiver.agent.lastName
          },
          sender: {
            id: sender.agentId,
            firstName: sender.agent.firstName,
            lastName: sender.agent.lastName
          },
          amount: data.amount
        }
      };
    });
    return result;
  }



  async getWallet(dto: GetWalletDto) {
    const wallet = await this.findWalletByUserId(dto.userId)

    if (!wallet) {
      return null
    }
    return wallet;
  }


  async chargeWalletBalance(dto: UpdateWalletBalanceDto) {

    const result = await this.prisma.$transaction(async (prisma) => {
      const wallet = await this.findWalletByUserId(dto.userId, prisma)
      if (!wallet) {
        return null
      }

      const update = await prisma.wallet.update({
        where: {
          agentId: dto.userId,
        },
        data: {
          balance: { decrement: +dto.amount },
        },
      });

      return update;
    });

    return result;
  }


  async findWalletByUserId(userId: number, prisma?: any) {
    if (prisma) {
      return await prisma.wallet.findFirst({ where: { agentId: userId }, include: { agent: true } })
    } else {
      return await this.prisma.wallet.findFirst({ where: { agentId: userId }, include: { agent: true } })
    }

  }

  async manualWalletCreation(user: User) {
    const wallet = await this.findWalletByUserId(user.id)
    if (wallet) {
      throw new ConflictException("User wallet exist")
    }

    const newWallet = await this.prisma.wallet.create({
      data: {
        agentId: user.id
      }
    })
    return newWallet
  }

  async myWallet(user: User) {
    const wallet = await this.prisma.wallet.findFirst({ where: { agentId: user.id } })
    if (!wallet) {
      throw new NotFoundException("No wallet found")
    }
    return wallet
  }

  async findOne(id: number) {
    const wallet = await this.prisma.wallet.findUnique({ where: { id: id } })
    if (!wallet) {
      throw new NotFoundException("No wallet found")
    }
    return wallet
  }
}
