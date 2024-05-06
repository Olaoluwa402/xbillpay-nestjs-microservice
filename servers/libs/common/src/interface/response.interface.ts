import { HttpStatus } from "@nestjs/common";

export interface IResponseData {
    [key: string]: any;
}

export interface IResponse {
    status: HttpStatus;
    data: IResponseData;
}

export type ResponsePayloadBase = {
    status: HttpStatus;
    message?: string;
};

export interface SuccessPayload extends ResponsePayloadBase {
    data?: any;
}

export interface FailPayload extends ResponsePayloadBase {
    error?: unknown;
}

export interface ResponsePayloadMap {
    failed: FailPayload;
    success: SuccessPayload;
}