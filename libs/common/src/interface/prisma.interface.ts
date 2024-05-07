import { PrismaClient } from '@prisma/client';

export type AnyModel = keyof PrismaClient;

// Define a type to extract the "where" property from a Prisma model
type WhereProperty<T> = T extends {
    where: infer U;
} ? U : never;

// Define the WhereInput type
export type WhereInput<T extends keyof PrismaClient> = {
    where: WhereProperty<PrismaClient[T]>;
};
export type GenericRecord<T> = {
    [key: string]: T;
};