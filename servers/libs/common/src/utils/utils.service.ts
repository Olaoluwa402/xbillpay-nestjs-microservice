import { BadRequestException, Global, HttpStatus, Injectable } from "@nestjs/common";
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { generate } from 'otp-generator';
import { User } from "@prisma/client";
import { FailPayload, IResponse, IResponseData, ResponsePayloadMap, SuccessPayload } from "../interface/response.interface";

type Format = string | null;

@Global()
@Injectable()
export class UtilsService {
    constructor() {
        dayjs.extend(utc);
        dayjs.extend(timezone);
    }

    getDate(add: number, format: Format = null, isTimeStamp = true) {
        const dt = new Date();
        const date = dayjs.utc(dt, 'z').add(add, 'day');
        return isTimeStamp ? dayjs(date).unix() : date.format(format); //epoch timestamp or normal date
    };

    serializeUser(user: User) {
        return Object.assign(user, {
            // Hide sensitive fields before sending to client
            toJSON: () => {
                const {
                    password,
                    ...rest
                } = user;
                return rest;
            },
        });
    };

    createSuccessResponse(data: IResponseData): IResponse {
        return {
            status: HttpStatus.OK,
            data
        };
    }

    createResponse<K extends keyof ResponsePayloadMap>(
        kind: K,
        payload: ResponsePayloadMap[K],
    ): ResponsePayloadMap[K] {
        if (kind === 'failed')
            return {
                status: payload.status,
                message: payload.message,
                error: (payload as FailPayload).error,
            } as FailPayload;
        return {
            status: payload.status,
            data: (payload as SuccessPayload).data,
            message: (payload as SuccessPayload).message,
        } as SuccessPayload;
    }

    async fetchApi(
        apiKey: string,
        baseEndpoint: string,
        method: string,
        bodyData: BodyInit,
        extraHeaderInfo: {} = {},
    ) {
        const config = {
            headers: {
                'Content-Type': 'Application/json',
                Authorization: apiKey,
                ...extraHeaderInfo,
            },
        };
        const url = `${baseEndpoint}`;
        const body: BodyInit =
            method === 'POST' ? bodyData : method === 'PATCH' ? bodyData : null;

        try {
            const res = await fetch(url, {
                headers: config.headers,
                method: method,
                mode: 'cors',
                body,
            });


            const successCodes = [200, 201, 202, 203, 204];


            const data = await res.json();
            return data;
        } catch (err) {
            console.log('fetchApi', err);
            throw new BadRequestException(
                this.createResponse('failed', {
                    status: HttpStatus.BAD_REQUEST,
                    message: err.message,
                }),
            );
        }
    };

    uniqueNumbers(num: number) {
        const otp = generate(num, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
        });

        return otp;
    };

}