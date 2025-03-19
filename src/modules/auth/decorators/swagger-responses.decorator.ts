import {
	ApiBadRequestResponse,
	ApiCreatedResponse,
	ApiInternalServerErrorResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiUnauthorizedResponse,
	ApiUnprocessableEntityResponse,
} from "@nestjs/swagger";
import { AccountExistenceSuccess, CheckOtpSuccess, RefreshTokenSuccess, SendOtpSuccess } from "../responses/success.response";
import { UnprocessableEntityResponse } from "src/common/responses/unprocessable.response";
import { InternalServerErrorResponse } from "src/common/responses/internal-server-error.response";
import { BadRequestResponse } from "src/common/responses/bad-request.response";
import { NotFoundResponse } from "src/common/responses/not-found.response";
import { UnauthorizedResponse } from "src/common/responses/unauthorized.response";

export function AccountExistenceResponses() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		ApiOkResponse({
			description: "Success Response",
			type: AccountExistenceSuccess,
		})(target, propertyKey, descriptor);

		ApiUnprocessableEntityResponse({
			description: "Unprocessable Entity Response",
			type: UnprocessableEntityResponse,
		})(target, propertyKey, descriptor);

		ApiInternalServerErrorResponse({
			description: "Internal Server Error",
			type: InternalServerErrorResponse,
		})(target, propertyKey, descriptor);
	};
}

export function SendOtpResponses() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		ApiCreatedResponse({
			description: "Success Response",
			type: SendOtpSuccess,
		})(target, propertyKey, descriptor);

		ApiBadRequestResponse({
			description: "Bad Request Response",
			type: BadRequestResponse,
		})(target, propertyKey, descriptor);

		ApiUnprocessableEntityResponse({
			description: "Unprocessable Entity Response",
			type: UnprocessableEntityResponse,
		})(target, propertyKey, descriptor);

		ApiInternalServerErrorResponse({
			description: "Internal Server Error",
			type: InternalServerErrorResponse,
		})(target, propertyKey, descriptor);
	};
}

export function CheckOtpResponses() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		ApiCreatedResponse({
			description: "Success Response",
			type: CheckOtpSuccess,
		})(target, propertyKey, descriptor);

		ApiUnauthorizedResponse({
			description: "Unauthorized Response",
			type: UnauthorizedResponse,
		})(target, propertyKey, descriptor);

		ApiNotFoundResponse({
			description: "account not fund Response",
			type: NotFoundResponse,
		})(target, propertyKey, descriptor);

		ApiUnprocessableEntityResponse({
			description: "Unprocessable Entity Response",
			type: UnprocessableEntityResponse,
		})(target, propertyKey, descriptor);

		ApiInternalServerErrorResponse({
			description: "Internal Server Error",
			type: InternalServerErrorResponse,
		})(target, propertyKey, descriptor);
	};
}

export function RefreshTokenResponses() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		ApiCreatedResponse({
			description: "Success Response",
			type: RefreshTokenSuccess,
		})(target, propertyKey, descriptor);

		ApiUnauthorizedResponse({
			description: "Unauthorized Response",
			type: UnauthorizedResponse,
		})(target, propertyKey, descriptor);

		ApiNotFoundResponse({
			description: "account not fund Response",
			type: NotFoundResponse,
		})(target, propertyKey, descriptor);

		ApiUnprocessableEntityResponse({
			description: "Unprocessable Entity Response",
			type: UnprocessableEntityResponse,
		})(target, propertyKey, descriptor);

		ApiInternalServerErrorResponse({
			description: "Internal Server Error",
			type: InternalServerErrorResponse,
		})(target, propertyKey, descriptor);
	};
}

export function LoginResponses() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		ApiCreatedResponse({
			description: "Success Response",
			type: CheckOtpSuccess,
		})(target, propertyKey, descriptor);

		ApiBadRequestResponse({
			description: "Bad Request Response",
			type: BadRequestResponse,
		})(target, propertyKey, descriptor);

		ApiUnauthorizedResponse({
			description: "Unauthorized Response",
			type: UnauthorizedResponse,
		})(target, propertyKey, descriptor);

		ApiNotFoundResponse({
			description: "account not fund Response",
			type: NotFoundResponse,
		})(target, propertyKey, descriptor);

		ApiUnprocessableEntityResponse({
			description: "Unprocessable Entity Response",
			type: UnprocessableEntityResponse,
		})(target, propertyKey, descriptor);

		ApiInternalServerErrorResponse({
			description: "Internal Server Error",
			type: InternalServerErrorResponse,
		})(target, propertyKey, descriptor);
	};
}
