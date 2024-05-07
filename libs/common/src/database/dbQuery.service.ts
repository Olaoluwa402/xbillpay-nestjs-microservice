import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AnyModel, WhereInput, GenericRecord } from '../interface/prisma.interface';

@Injectable()
export class DbQueryService {
    protected readonly logger: Logger = new Logger(this.constructor.name);

    constructor(private prisma: PrismaService) {
    }
    async create(modelName: string, data: Record<string, any>): Promise<any> {
        try {
            return await this.prisma[modelName].create({ data });
        } catch (error) {
            this.logger.error(error.message);
            throw new Error('Failed to create entity.');
        }
    }

    async findOne(modelName: string, filter: Record<string, any>): Promise<any> {
        const entity = await this.prisma[modelName].findUnique({ where: filter });

        if (!entity) {
            this.logger.warn('Entity not found with filter:', filter);
            throw new NotFoundException('Entity not found.');
        }

        return entity;
    }

    async findOneAndUpdate(modeName: string, filter: Record<string, any>, data: Record<string, any>): Promise<any> {
        try {
            const updatedEntity = await this.prisma[modeName].update({
                where: filter,
                data,
            });

            if (!updatedEntity) {
                this.logger.warn('Entity not found with filter:', filter);
                throw new NotFoundException('Entity not found.');
            }

            return updatedEntity;
        } catch (error) {
            this.logger.error(error.message);
            throw new Error('Failed to update entity.');
        }
    }

    async upsert(modelName: string, filter: Record<string, any>, data: Record<string, any>): Promise<any> {
        return await this.prisma[modelName].upsert({
            where: filter,
            update: data,
            create: data,
        });
    }

    async findMany(modelName: string, filter: Record<string, any>): Promise<any[]> {
        return await this.prisma[modelName].findMany({ where: filter });
    }

    // async startTransaction<any>(operations: Prisma.PrismaPromise<any>[], isolationLevel?: Prisma.TransactionIsolationLevel): Promise<T[]> {
    //     await this.prisma.$connect();
    //     return await this.prisma.$transaction(operations, { isolationLevel });
    // }

    async paginate<T extends AnyModel>(
        model: T,
        query: WhereInput<any>,
        page: number = 1,
        pageSize: number = 20,
        otherQueryArgs?: GenericRecord<any>
    ) {
        const skip = (page - 1) * pageSize;
        //@ts-ignore
        const record = await this.prisma[model].findMany({
            where: query.where,
            ...otherQueryArgs,
            orderBy: {
                createdAt: 'desc',
            },
            skip,
            take: pageSize,
        });

        //@ts-ignore
        const totalCount = await this.prisma[model].count({ where: query.where });
        const totalPages = Math.ceil(totalCount / pageSize);

        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return {
            currentPage: page,
            totalPages,
            hasNextPage,
            hasPrevPage,
            nextPage: hasNextPage ? page + 1 : null,
            prevPage: hasPrevPage ? page - 1 : null,
            record,
        };
    }

}
