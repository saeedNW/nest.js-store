import {
	ApiBadRequestResponse,
	ApiCreatedResponse,
	ApiForbiddenResponse,
	ApiInternalServerErrorResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiUnauthorizedResponse,
	ApiUnprocessableEntityResponse
} from "@nestjs/swagger";
import {
	FileUploadSuccess,
	FindAllFilesSuccess,
	FindSingleFilesSuccess,
	RemoveFileSuccess
} from "../responses/success.response";
import { UnauthorizedResponse } from "src/common/responses/unauthorized.response";
import { AccessDeniedResponse } from "src/common/responses/access-denied.response";
import { InternalServerErrorResponse } from "src/common/responses/internal-server-error.response";
import { UnprocessableEntityResponse } from "src/common/responses/unprocessable.response";
import { BadRequestResponse } from "src/common/responses/bad-request.response";
import { NotFoundResponse } from "src/common/responses/not-found.response";

export function FileUploadResponses() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		ApiCreatedResponse({
			description: "Success Response",
			type: FileUploadSuccess,
		})(target, propertyKey, descriptor);

		ApiBadRequestResponse({
			description: "Bad Request Response",
			type: BadRequestResponse,
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

export function FindAllFilesResponses() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		ApiOkResponse({
			description: "Success Response",
			type: FindAllFilesSuccess,
		})(target, propertyKey, descriptor);

		ApiInternalServerErrorResponse({
			description: "Internal Server Error",
			type: InternalServerErrorResponse,
		})(target, propertyKey, descriptor);
	};
}

export function FindOneFileResponses() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		ApiOkResponse({
			description: "Success Response",
			type: FindSingleFilesSuccess,
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

export function RemoveFileResponses() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		ApiOkResponse({
			description: "Success Response",
			type: RemoveFileSuccess,
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
