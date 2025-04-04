import { ApiBadRequestResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiUnauthorizedResponse, ApiUnprocessableEntityResponse } from "@nestjs/swagger";
import { CreateBlogSuccess, FindAllBlogsSuccess, FindOneBlogsSuccess, RemoveBlogSuccess, TrashBlogSuccess, UpdateBlogSuccess } from "../responses/success.response";
import { UnauthorizedResponse } from "src/common/responses/unauthorized.response";
import { AccessDeniedResponse } from "src/common/responses/access-denied.response";
import { UnprocessableEntityResponse } from "src/common/responses/unprocessable.response";
import { InternalServerErrorResponse } from "src/common/responses/internal-server-error.response";
import { NotFoundResponse } from "src/common/responses/not-found.response";
import { BadRequestResponse } from "src/common/responses/bad-request.response";

export function CreateBlogResponses() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		ApiCreatedResponse({
			description: "Success Response",
			type: CreateBlogSuccess,
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

export function FindAllBlogsResponses() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		ApiOkResponse({
			description: "Success Response",
			type: FindAllBlogsSuccess,
		})(target, propertyKey, descriptor);

		ApiInternalServerErrorResponse({
			description: "Internal Server Error",
			type: InternalServerErrorResponse,
		})(target, propertyKey, descriptor);
	};
}

export function FindOneBlogResponses() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		ApiOkResponse({
			description: "Success Response",
			type: FindOneBlogsSuccess,
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

export function UpdateBlogResponses() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		ApiOkResponse({
			description: "Success Response",
			type: UpdateBlogSuccess,
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

export function TrashBlogResponses() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		ApiOkResponse({
			description: "Success Response",
			type: TrashBlogSuccess,
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

export function RemoveBlogResponses() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		ApiOkResponse({
			description: "Success Response",
			type: RemoveBlogSuccess,
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
