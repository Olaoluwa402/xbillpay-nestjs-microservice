import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, Length } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {

    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    firstName: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    lastName: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    phoneNumber: string;

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    @ApiProperty()
    email: string;

    @IsNotEmpty()
    @IsString()
    @Length(5, 20)
    @ApiProperty()
    password: string;
}