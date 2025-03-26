import { ApiCreatedResponse, ApiForbiddenResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiUnauthorizedResponse, ApiUnprocessableEntityResponse } from "@nestjs/swagger";
import { CreateAddressSuccess, findAllAddressesSuccess, findOneAddressSuccess, RemoveAddressSuccess, UpdateAddressSuccess } from "../responses/address.success.response";
import { UnauthorizedResponse } from "src/common/responses/unauthorized.response";
import { NotFoundResponse } from "src/common/responses/not-found.response";
import { UnprocessableEntityResponse } from "src/common/responses/unprocessable.response";
import { InternalServerErrorResponse } from "src/common/responses/internal-server-error.response";
import { AccessDeniedResponse } from "src/common/responses/access-denied.response";

export function CreateAddressResponses() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		ApiCreatedResponse({
			description: "Success Response",
			type: CreateAddressSuccess,
		})(target, propertyKey, descriptor);

		ApiUnauthorizedResponse({
			description: "Unauthorized Response",
			type: UnauthorizedResponse,
		})(target, propertyKey, descriptor);

		ApiNotFoundResponse({
			description: "Not fund Response",
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

export function findAllAddressesResponses() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		ApiOkResponse({
			description: "Success Response",
			type: findAllAddressesSuccess,
		})(target, propertyKey, descriptor);

		ApiUnauthorizedResponse({
			description: "Unauthorized Response",
			type: UnauthorizedResponse,
		})(target, propertyKey, descriptor);

		ApiNotFoundResponse({
			description: "Not fund Response",
			type: NotFoundResponse,
		})(target, propertyKey, descriptor);

		ApiInternalServerErrorResponse({
			description: "Internal Server Error",
			type: InternalServerErrorResponse,
		})(target, propertyKey, descriptor);
	};
}

export function findOneAddressResponses() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		ApiOkResponse({
			description: "Success Response",
			type: findOneAddressSuccess,
		})(target, propertyKey, descriptor);

		ApiUnauthorizedResponse({
			description: "Unauthorized Response",
			type: UnauthorizedResponse,
		})(target, propertyKey, descriptor);

		ApiNotFoundResponse({
			description: "Not fund Response",
			type: NotFoundResponse,
		})(target, propertyKey, descriptor);

		ApiInternalServerErrorResponse({
			description: "Internal Server Error",
			type: InternalServerErrorResponse,
		})(target, propertyKey, descriptor);
	};
}

export function UpdateAddressResponses() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		ApiOkResponse({
			description: "Success Response",
			type: UpdateAddressSuccess,
		})(target, propertyKey, descriptor);

		ApiUnauthorizedResponse({
			description: "Unauthorized Response",
			type: UnauthorizedResponse,
		})(target, propertyKey, descriptor);

		ApiNotFoundResponse({
			description: "Not fund Response",
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

export function RemoveAddressResponses() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		ApiOkResponse({
			description: "Success Response",
			type: RemoveAddressSuccess,
		})(target, propertyKey, descriptor);

		ApiUnauthorizedResponse({
			description: "Unauthorized Response",
			type: UnauthorizedResponse,
		})(target, propertyKey, descriptor);

		ApiNotFoundResponse({
			description: "Not fund Response",
			type: NotFoundResponse,
		})(target, propertyKey, descriptor);

		ApiInternalServerErrorResponse({
			description: "Internal Server Error",
			type: InternalServerErrorResponse,
		})(target, propertyKey, descriptor);
	};
}

export function CreateUserAddressResponses() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		ApiCreatedResponse({
			description: "Success Response",
			type: CreateAddressSuccess,
		})(target, propertyKey, descriptor);

		ApiUnauthorizedResponse({
			description: "Unauthorized Response",
			type: UnauthorizedResponse,
		})(target, propertyKey, descriptor);

		ApiForbiddenResponse({
			description: "Forbidden Response",
			type: AccessDeniedResponse,
		})(target, propertyKey, descriptor);

		ApiNotFoundResponse({
			description: "Not fund Response",
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

export function findUserAddressesResponses() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		ApiOkResponse({
			description: "Success Response",
			type: findAllAddressesSuccess,
		})(target, propertyKey, descriptor);

		ApiUnauthorizedResponse({
			description: "Unauthorized Response",
			type: UnauthorizedResponse,
		})(target, propertyKey, descriptor);

		ApiForbiddenResponse({
			description: "Forbidden Response",
			type: AccessDeniedResponse,
		})(target, propertyKey, descriptor);

		ApiInternalServerErrorResponse({
			description: "Internal Server Error",
			type: InternalServerErrorResponse,
		})(target, propertyKey, descriptor);
	};
}

export function findUserSingleAddressResponses() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		ApiOkResponse({
			description: "Success Response",
			type: findOneAddressSuccess,
		})(target, propertyKey, descriptor);

		ApiUnauthorizedResponse({
			description: "Unauthorized Response",
			type: UnauthorizedResponse,
		})(target, propertyKey, descriptor);

		ApiForbiddenResponse({
			description: "Forbidden Response",
			type: AccessDeniedResponse,
		})(target, propertyKey, descriptor);

		ApiNotFoundResponse({
			description: "Not fund Response",
			type: NotFoundResponse,
		})(target, propertyKey, descriptor);

		ApiInternalServerErrorResponse({
			description: "Internal Server Error",
			type: InternalServerErrorResponse,
		})(target, propertyKey, descriptor);
	};
}

export function UpdateUserAddressResponses() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		ApiOkResponse({
			description: "Success Response",
			type: UpdateAddressSuccess,
		})(target, propertyKey, descriptor);

		ApiUnauthorizedResponse({
			description: "Unauthorized Response",
			type: UnauthorizedResponse,
		})(target, propertyKey, descriptor);

		ApiForbiddenResponse({
			description: "Forbidden Response",
			type: AccessDeniedResponse,
		})(target, propertyKey, descriptor);

		ApiNotFoundResponse({
			description: "Not fund Response",
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

export function RemoveUserAddressResponses() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		ApiOkResponse({
			description: "Success Response",
			type: RemoveAddressSuccess,
		})(target, propertyKey, descriptor);

		ApiUnauthorizedResponse({
			description: "Unauthorized Response",
			type: UnauthorizedResponse,
		})(target, propertyKey, descriptor);

		ApiForbiddenResponse({
			description: "Forbidden Response",
			type: AccessDeniedResponse,
		})(target, propertyKey, descriptor);

		ApiNotFoundResponse({
			description: "Not fund Response",
			type: NotFoundResponse,
		})(target, propertyKey, descriptor);

		ApiInternalServerErrorResponse({
			description: "Internal Server Error",
			type: InternalServerErrorResponse,
		})(target, propertyKey, descriptor);
	};
}
