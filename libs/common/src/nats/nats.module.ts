import { Module, DynamicModule } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { NatsService } from "./nats.service";

interface NatsModuleOptions {
    name: string;
}

@Module({
    imports: [ConfigModule],
    providers: [NatsService],
    exports: [NatsService, ClientsModule] // Export NatsService and ClientsModule for use in other modules
})
export class NatsModule {
    static register({ name }: NatsModuleOptions): DynamicModule {
        return {
            module: NatsModule,
            imports: [
                ClientsModule.registerAsync([
                    {
                        name,
                        useFactory: (configService: ConfigService) => ({
                            transport: Transport.NATS,
                            options: {
                                servers: [configService.get<string>('NATS_URL')],
                            },
                        }),
                        inject: [ConfigService],
                    },
                ]),
            ],
        };
    }
}
