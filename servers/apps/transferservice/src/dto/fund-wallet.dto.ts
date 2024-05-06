import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class FundWalletDto {
    @IsNotEmpty()
    @IsNumber()
    @ApiProperty()
    amount: number
}

export class CompleteWalletFundingDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    paystackReference: string
}

export class WalletToWalletTransferDto {
    @IsNotEmpty()
    @IsNumber()
    @ApiProperty()
    amount: number

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty()
    receiverId: number
}