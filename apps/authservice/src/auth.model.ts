import { Prisma } from '@prisma/client';

export class UserInput implements Prisma.UserCreateInput {
    id: number;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
}
