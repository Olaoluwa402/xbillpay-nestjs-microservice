import { IsEnum, IsInt, IsNotEmpty, IsString, Length } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';


enum Provider {
    MTN = 'MTN',
    GLO = 'GLO',
    AIRTEL = 'AIRTEL',
    NINE_MOBILE = '9mobile',
}


export class GetAirTimeDto {

    @IsNotEmpty()
    @IsInt()
    @ApiProperty()
    amount: number;

    @IsNotEmpty()
    @IsEnum(Provider)
    @ApiProperty()
    network_provider: Provider;

    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    phone_number: string;
}

enum UtilityService {
    POSTPAID = 'POSTPAID',
    PREPAID = 'PREPAID',
}

export class DataBundleQueryDto {
    @IsNotEmpty()
    @IsEnum(Provider)
    @ApiProperty()
    network_provider: Provider;
}


export class ValidateUtilityDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    meterNo: string;

    @IsNotEmpty()
    @IsEnum(UtilityService)
    @ApiProperty()
    type: UtilityService;

    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    biller: string;
}

export class GetDataDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    data_plan: string;

    @IsNotEmpty()
    @IsEnum(Provider)
    @ApiProperty()
    network_provider: Provider;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    phone_number: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    amount: number;
}

export class PayForUtilityDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    meterNo: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    biller: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    address: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    phone_number: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    amount: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsEnum(UtilityService)
    type: UtilityService;
}