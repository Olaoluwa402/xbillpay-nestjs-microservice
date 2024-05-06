/* eslint-disable */
import { Injectable, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get('MYSQL_URL'),
        },
      },
    });
  }

  async enableShutdownHooks(app: INestApplication) {
    //@ts-ignore
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }



  cleanDb() {
    return this.$transaction([this.user.deleteMany()]);
  }
}
