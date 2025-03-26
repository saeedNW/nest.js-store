import { ApiBadRequestResponse, ApiConflictResponse, ApiForbiddenResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiUnauthorizedResponse, ApiUnprocessableEntityResponse } from "@nestjs/swagger";
import { AssignRoleSuccess, FindAllUsersSuccess, FindOneUserSuccess, RetrieveUserSuccess, UpdatePasswordSuccess, UpdatePhoneSuccess, UpdateUserPasswordSuccess, UpdateUserPhoneSuccess, VerifyPhoneSuccess } from "../responses/user.success.resopnse";
import { UnauthorizedResponse } from "src/common/responses/unauthorized.response";
import { InternalServerErrorResponse } from "src/common/responses/internal-server-error.response";
import { UnprocessableEntityResponse } from "src/common/responses/unprocessable.response";
import { NotFoundResponse } from "src/common/responses/not-found.response";
import { BadRequestResponse } from "src/common/responses/bad-request.response";
import { ConflictResponse } from "src/common/responses/conflict.response";
import { AccessDeniedResponse } from "src/common/responses/access-denied.response";

export function RetrieveUserResponses() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		ApiOkResponse({
			description: "Success Response",
			type: RetrieveUserSuccess,
		})(target, propertyKey, descriptor);

		ApiUnauthorizedResponse({
			description: "Unauthorized Response",
			type: UnauthorizedResponse,
		})(target, propertyKey, descriptor);

		ApiInternalServerErrorResponse({
			description: "Internal Server Error",
			type: InternalServerErrorResponse,
		})(target, propertyKey, descriptor);
	};
}

export function UpdatePasswordResponses() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		ApiOkResponse({
			description: "Success Response",
			type: UpdatePasswordSuccess,
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

export function UpdatePhoneResponses() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		ApiOkResponse({
			description: "Success Response",
			type: UpdatePhoneSuccess,
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
			description: "Not fund Response",
			type: NotFoundResponse,
		})(target, propertyKey, descriptor);

		ApiConflictResponse({
			description: "Conflict Response",
			type: ConflictResponse,
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

export function VerifyPhoneResponses() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		ApiOkResponse({
			description: "Success Response",
			type: VerifyPhoneSuccess,
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

export function findAllUsersResponses() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		ApiOkResponse({
			description: "Success Response",
			type: FindAllUsersSuccess,
		})(target, propertyKey, descriptor);

		ApiUnauthorizedResponse({
			description: "Unauthorized Response",
			type: UnauthorizedResponse,
		})(target, propertyKey, descriptor);

		ApiForbiddenResponse({
			description: "Forbidden Response",
			type: AccessDeniedResponse,
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

export function FindOneUserResponses() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		ApiOkResponse({
			description: "Success Response",
			type: FindOneUserSuccess,
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

export function UpdateUserPasswordResponses() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		ApiOkResponse({
			description: "Success Response",
			type: UpdateUserPasswordSuccess,
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

export function UpdateUserPhoneResponses() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		ApiOkResponse({
			description: "Success Response",
			type: UpdateUserPhoneSuccess,
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

		ApiConflictResponse({
			description: "Conflict Response",
			type: ConflictResponse,
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

export function AssignRoleResponses() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		ApiOkResponse({
			description: "Success Response",
			type: AssignRoleSuccess,
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
