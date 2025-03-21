import {
	ApiForbiddenResponse,
	ApiInternalServerErrorResponse,
	ApiOkResponse,
	ApiUnauthorizedResponse,
	ApiUnprocessableEntityResponse,
} from "@nestjs/swagger";
import { UnprocessableEntityResponse } from "src/common/responses/unprocessable.response";
import { InternalServerErrorResponse } from "src/common/responses/internal-server-error.response";
import { UnauthorizedResponse } from "src/common/responses/unauthorized.response";
import { AccessDeniedResponse } from "src/common/responses/access-denied.response";
import { FindPaginatedPermissionsSuccess, FindRawPermissionsSuccess } from "../responses/permission-success.response";

export function FindRawPermissionsResponses() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		ApiOkResponse({
			description: "Success Response",
			type: FindRawPermissionsSuccess,
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

export function FindPaginatedPermissionsResponses() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		ApiOkResponse({
			description: "Success Response",
			type: FindPaginatedPermissionsSuccess,
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
