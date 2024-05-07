import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FundWalletDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    amount: number;
}

export class CompleteWalletFundingDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    paystackReference: string;
}

export class WalletToWalletTransferDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    receiverId: number;
}
