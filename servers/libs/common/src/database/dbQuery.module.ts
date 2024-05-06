import { Module } from "@nestjs/common";
import { DbQueryService } from "./dbQuery.service";

@Module({
    imports: [DbQueryService],
    exports: [DbQueryService]
})

export class DbQueryModule { }