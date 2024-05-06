import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { PaymentserviceService } from './paymentservice.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser, JwtGuard, Roles, RolesGuard, UtilsService } from '@app/common';
import { Role, User } from '@prisma/client';
import { DataBundleQueryDto, GetAirTimeDto, GetDataDto, PayForUtilityDto, ValidateUtilityDto } from './dto/payment.dto';


@ApiTags('bills')
@Controller("bills")
export class PaymentserviceController {
  constructor(
    private paymentserviceService: PaymentserviceService,
    private utilService: UtilsService
  ) { }

  @UseGuards(JwtGuard, RolesGuard)
  @Get()
  @Roles(Role.AGENT)
  @ApiOperation({ summary: 'get bills' })
  async getBills(@GetUser() user: User): Promise<any> {
    return this.utilService.createResponse("success", {
      status: HttpStatus.OK,
      data: await this.paymentserviceService.getBills(user)
    })
  }


  @HttpCode(HttpStatus.OK)
  @Get('get-airtimedata-networks')
  @ApiOperation({ summary: 'get available airtimedata networks' })
  getNetworks() {
    return this.utilService.createResponse('success', {
      status: HttpStatus.OK,
      data: ['MTN', 'AIRTEL', 'GLO', '9MOBILE']
    });
  }

  @HttpCode(HttpStatus.OK)
  @Get('get-utility-types')
  @ApiOperation({ summary: 'get availble utility types' })
  getUtilityTypes() {
    return this.utilService.createResponse('success', {
      status: HttpStatus.OK,
      data: ['PREPAID', 'POSTPAID']
    });
  }

  @HttpCode(HttpStatus.OK)
  @Get('get-utility-billers')
  @ApiOperation({ summary: 'get utility billers' })
  async getUtilityServices() {
    return this.utilService.createResponse('success', {
      status: HttpStatus.OK,
      data: await this.paymentserviceService.getUtilityServices(),
    });
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.AGENT)
  @ApiOperation({ summary: 'validate utility' })
  @Post('validate-utility')
  async validateUtility(
    @GetUser() user: User,
    @Body() dto: ValidateUtilityDto,
  ) {
    return this.utilService.createResponse('success', {
      status: HttpStatus.OK,
      data: await this.paymentserviceService.validateUtility(user, dto),
    });
  }

  @HttpCode(HttpStatus.OK)
  @Get('get-data-bundle')
  @ApiOperation({ summary: 'get available data bundles' })
  async getDataBundle(@Query() query: DataBundleQueryDto) {
    return this.utilService.createResponse('success', {
      status: HttpStatus.OK,
      data: await this.paymentserviceService.getDataBundle(query),
    });
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Post('get-airtime')
  @Roles(Role.AGENT)
  @ApiOperation({ summary: 'get airtime' })
  async getAirTime(@GetUser() user: User, @Body() dto: GetAirTimeDto) {
    return this.utilService.createResponse('success', {
      status: HttpStatus.OK,
      data: await this.paymentserviceService.getAirTime(user, dto),
    });
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.AGENT)
  @ApiOperation({ summary: 'get data' })
  @Post('get-data')
  async getData(@GetUser() user: User, @Body() dto: GetDataDto) {
    return this.utilService.createResponse('success', {
      status: HttpStatus.OK,
      data: await this.paymentserviceService.getData(user, dto),
    });
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard, RolesGuard)
  @Post('pay-for-utility')
  async payForUtility(@GetUser() user: User, @Body() dto: PayForUtilityDto) {
    return this.utilService.createResponse('success', {
      status: HttpStatus.OK,
      data: await this.paymentserviceService.payForUtility(user, dto),
    });
  }




}

