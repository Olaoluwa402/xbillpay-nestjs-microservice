import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateWalletDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    userId: number;
}

export class FundWalletDto extends CreateWalletDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    amount: number;
}

export class WalletToWalletTransferDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    amount: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    receiverId: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    senderId: number;
}

export class GetWalletDto extends CreateWalletDto {}

export class UpdateWalletBalanceDto extends CreateWalletDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    amount: number;
}
