import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Transport, NatsOptions } from "@nestjs/microservices";


@Injectable()
export class NatsService {
    constructor(private readonly configService: ConfigService) { }

    getOptions(queue?: string): NatsOptions {
        return {
            transport: Transport.NATS,
            options: {
                servers: [this.configService.get<string>('NATS_URL')],
            },
        };
    }
}