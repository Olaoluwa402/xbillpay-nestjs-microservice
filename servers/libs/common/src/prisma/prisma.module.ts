/* eslint-disable */
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() //make it available to all modules in our application
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule { }
