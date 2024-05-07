import { PrismaService, UtilsService } from '@app/common';
import { BadRequestException, ConflictException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BillStatus, BillType, Prisma, TransactionType, User } from '@prisma/client';
import { DataBundleQueryDto, GetAirTimeDto, GetDataDto, PayForUtilityDto, ValidateUtilityDto } from './dto/payment.dto';
import { lastValueFrom } from 'rxjs';
import { WALLET_SERVICE } from '@app/common/constants';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentserviceService {
  constructor(
    private prismaService: PrismaService,
    @Inject(WALLET_SERVICE) private walletClient: ClientProxy,
    private utilService: UtilsService,
    private configService: ConfigService
  ) { }

  async getBills(user: User): Promise<any> {
    return await this.prismaService.bill.findMany({
      where: {
        payee: { id: user.id }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  async getUtilityServices() {
    const services = [
      { name: 'AEDC', location: 'Abuja' },
      { name: 'KAEDC', location: 'Kaduna' },
      { name: 'JEDC', location: 'Jos' },
      { name: 'IKEDC', location: 'Ikeja' },
      { name: 'EKEDC', location: ' Eko' },
      { name: 'KEDC', location: 'Kano' },
      { name: 'EEDC', location: 'Enugu' },
      { name: 'PHEDC', location: 'Portharcout' },
      { name: 'IBEDC', location: 'Ibadan' },
    ];

    return services;
  }

  async validateUtility(user: User, dto: ValidateUtilityDto) {
    try {
      const method = 'POST';
      const apiKey = `${this.configService.get<string>('SHAGO_KEY')}`;
      const extra = { hashKey: this.configService.get<string>('SHAGO_KEY') };
      const baseEndpointUrl = `${this.configService.get<string>('SHAGO_URL')}`;

      const body = JSON.stringify({
        serviceCode: 'AOV',
        meterNo: dto.meterNo,
        type: dto.type,
        disco: dto.biller,
      });

      const result = await this.utilService.fetchApi(
        apiKey,
        baseEndpointUrl,
        method,
        body,
        extra,
      );
      return result;
    } catch (err) {
      throw new BadRequestException(this.utilService.createResponse('failed', {
        status: err.status,
        message: err.message,
      }))
    }
  }

  async getDataBundle(query: DataBundleQueryDto) {
    try {
      const method = 'POST';
      const apiKey = `${this.configService.get<string>('SHAGO_KEY')}`;
      const extra = { hashKey: this.configService.get<string>('SHAGO_KEY') };
      const baseEndpointUrl = `${this.configService.get<string>('SHAGO_URL')}`;
      const body = JSON.stringify({
        serviceCode: 'VDA',
        phone: '',
        network: query.network_provider,
      });

      const result = await this.utilService.fetchApi(
        apiKey,
        baseEndpointUrl,
        method,
        body,
        extra,
      );
      return result;
    } catch (err) {
      throw new BadRequestException(this.utilService.createResponse('failed', {
        status: err.status,
        message: err.message,
      }))
    }
  }

  async confirmUserHasEnoughBalance(userId: number, amount: number) {
    // check that sender has enough banlance for the transaction
    const walletResponse = await lastValueFrom(this.walletClient.send({ cmd: "get_wallet" }, { userId: userId }))

    if (!walletResponse.data) {
      throw new BadRequestException(this.utilService.createResponse('failed', {
        status: HttpStatus.BAD_REQUEST,
        message: `"You need to have a wallet"`,
      }))
    }

    if (+walletResponse.data.balance < amount) {
      throw new ConflictException(
        this.utilService.createResponse('failed', {
          status: HttpStatus.CONFLICT,
          message: `Insufficient credit balance`,
        }),
      );
    }
  }

  async getAirTime(user: User, dto: GetAirTimeDto) {
    try {
      await this.confirmUserHasEnoughBalance(user.id, dto.amount)

      //make api call to send airtime
      const ref = this.utilService.uniqueNumbers(11);
      await this.payForAirTime(dto, ref);

      // - balance the wallet against the amount of airtime purchased if payment successfull
      await lastValueFrom(this.walletClient.emit(
        { cmd: "charge_wallet_balance" },
        { userId: user.id, amount: dto.amount }))

      //create bill
      const extralInfo = {
        firstName: user.firstName,
        lastName: user.lastName,
        serviceCode: 'QAB',
      }

      await this.prismaService.bill.create({
        data: {
          payeeId: user.id,
          reference: ref,
          status: BillStatus.PAID,
          type: BillType.AIRTIME,
          amount: dto.amount,
          paymentDate: new Date(),
          extralInfo: extralInfo as Prisma.JsonObject
        },
      });

      return 'Airtime sent';
    } catch (err) {
      throw new BadRequestException(this.utilService.createResponse('failed', {
        status: err.status,
        message: err.message,
      }))
    }
  }


  async getData(user: User, dto: GetDataDto) {
    try {

      await this.confirmUserHasEnoughBalance(user.id, dto.amount)

      //make api call to send airtime
      const ref = this.utilService.uniqueNumbers(11);

      await this.payForData(dto, ref);

      // - balance the wallet against the amount of airtime purchased if payment successfull
      await lastValueFrom(this.walletClient.emit(
        { cmd: "charge_wallet_balance" },
        { userId: user.id, amount: dto.amount }))

      //create bill
      const extralInfo = {
        firstName: user.firstName,
        lastName: user.lastName,
        serviceCode: 'BDA',
      }

      await this.prismaService.bill.create({
        data: {
          payeeId: user.id,
          reference: ref,
          status: BillStatus.PAID,
          type: BillType.DATA,
          amount: dto.amount,
          paymentDate: new Date(),
          extralInfo: extralInfo as Prisma.JsonObject
        },
      });

      return 'Data sent';
    } catch (err) {
      throw new BadRequestException(this.utilService.createResponse('failed', {
        status: err.status,
        message: err.message,
      }))
    }
  }


  async payForUtility(user: User, dto: PayForUtilityDto) {
    try {
      await this.confirmUserHasEnoughBalance(user.id, dto.amount)

      const ref = this.utilService.uniqueNumbers(11);

      await this.payForUtilityBill(dto, ref);

      await lastValueFrom(this.walletClient.emit(
        { cmd: "charge_wallet_balance" },
        { userId: user.id, amount: dto.amount }))

      const extralInfo = {
        ...dto,
        serviceCode: 'AOB',
      }

      await this.prismaService.bill.create({
        data: {
          payeeId: user.id,
          reference: ref,
          status: BillStatus.PAID,
          type: BillType.DATA,
          amount: dto.amount,
          paymentDate: new Date(),
          extralInfo: extralInfo as Prisma.JsonObject
        },
      });


      return 'Payment successfull';
    } catch (err) {
      throw new BadRequestException(this.utilService.createResponse('failed', {
        status: err.status,
        message: err.message,
      }))
    }
  }


  async payForAirTime(dto: GetAirTimeDto, ref: string) {
    try {
      const method = 'POST';
      const apiKey = `${this.configService.get<string>('SHAGO_KEY')}`;
      const extra = { hashKey: this.configService.get<string>('SHAGO_KEY') };
      const baseEndpointUrl = `${this.configService.get<string>('SHAGO_URL')}`;
      const body = JSON.stringify({
        serviceCode: 'QAB',
        phone: dto.phone_number,
        amount: dto.amount,
        vend_type: 'VTU',
        network: dto.network_provider,
        request_id: ref,
      });

      const result = await this.utilService.fetchApi(
        apiKey,
        baseEndpointUrl,
        method,
        body,
        extra,
      );
      return result;
    } catch (err) {
      throw new BadRequestException(this.utilService.createResponse('failed', {
        status: err.status,
        message: err.message,
      }))
    }
  }

  async payForData(dto: GetDataDto, ref: string) {
    try {
      const method = 'POST';
      const apiKey = `${this.configService.get<string>('SHAGO_KEY')}`;
      const extra = { hashKey: this.configService.get<string>('SHAGO_KEY') };
      const baseEndpointUrl = `${this.configService.get<string>('SHAGO_URL')}`;

      const body = JSON.stringify({
        serviceCode: 'BDA',
        phone: dto.phone_number,
        amount: dto.amount,
        bundle: dto.data_plan,
        network: dto.network_provider,
        package: dto.data_plan,
        request_id: ref,
      });

      const result = await this.utilService.fetchApi(
        apiKey,
        baseEndpointUrl,
        method,
        body,
        extra,
      );
      return result;
    } catch (err) {
      throw new BadRequestException(this.utilService.createResponse('failed', {
        status: err.status,
        message: err.message,
      }))
    }
  }


  async payForUtilityBill(dto: PayForUtilityDto, ref: string) {
    try {
      const method = 'POST';
      const apiKey = `${this.configService.get<string>('SHAGO_KEY')}`;
      const extra = { hashKey: this.configService.get<string>('SHAGO_KEY') };
      const baseEndpointUrl = `${this.configService.get<string>('SHAGO_URL')}`;

      const body = JSON.stringify({
        serviceCode: 'AOB',
        disco: dto.biller,
        meterNo: dto.meterNo,
        type: dto.type,
        amount: dto.amount,
        phonenumber: dto.phone_number,
        name: dto.name,
        address: dto.address,
        request_id: ref,
      });

      const result = await this.utilService.fetchApi(
        apiKey,
        baseEndpointUrl,
        method,
        body,
        extra,
      );

      return result;
    } catch (err) {
      throw new BadRequestException(this.utilService.createResponse('failed', {
        status: err.status,
        message: err.message,
      }))
    }
  }



}
