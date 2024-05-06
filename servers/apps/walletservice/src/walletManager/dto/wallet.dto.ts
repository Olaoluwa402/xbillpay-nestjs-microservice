import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateWalletDto {
    @IsNotEmpty()
    @IsNumber()
    userId: number;
}

export class FundWalletDto extends CreateWalletDto {
    @IsNotEmpty()
    @IsNumber()
    @ApiProperty()
    amount: number;
}

export class WalletToWalletTransferDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    amount: number

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty()
    receiverId: number

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty()
    senderId: number
}


export class GetWalletDto extends CreateWalletDto {
}

export class UpdateWalletBalanceDto extends CreateWalletDto {
    @IsNotEmpty()
    @IsNumber()
    @ApiProperty()
    amount: number;
}