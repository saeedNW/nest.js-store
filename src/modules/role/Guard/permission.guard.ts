import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { Request } from "express";
import { I18nContext, I18nService } from 'nestjs-i18n';
import { PERMISSION_KEY } from "src/common/decorator/permission.decorator";
import { Permissions } from "src/common/enums/permissions.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class PermissionGuard implements CanActivate {
	constructor(
		// Register reflector which contains request's metadata
		private reflector: Reflector,
		// Register i18n service
		private readonly i18n: I18nService,
		// Inject user repository
		@InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,

	) { }

	/**
	 * Determines if the request should be allowed based on the user's permissions.
	 * @param {ExecutionContext} context - The execution context of the request.
	 * @returns {Promise<boolean>} - Returns `true` if access is granted, otherwise throws an exception.
	 */
	async canActivate(context: ExecutionContext): Promise<boolean> {
		// retrieve request object
		const request: Request = context.switchToHttp().getRequest<Request>();

		// Retrieve required permissions from metadata
		const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSION_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		// If no permissions are required, allow access
		if (!requiredPermissions || requiredPermissions.length === 0) {
			return true;
		}

		// Retrieve user from request
		const user = await this.getUserWithRole(request?.user?.id);
		if (!user) {
			throw new ForbiddenException(this.i18n.t('locale.PublicMessages.AccessDenied', {
				lang: I18nContext?.current()?.lang
			}));
		}

		// Admin role check
		if (user.role.title === "user") {
			throw new ForbiddenException(this.i18n.t('locale.PublicMessages.AccessDenied', {
				lang: I18nContext?.current()?.lang
			}));
		}

		// Check if user has the required permissions
		const hasPermission = user.role.permissions.some((perm) =>
			perm.title === Permissions.Master || requiredPermissions.includes(perm.title)
		);

		if (!hasPermission) {
			throw new ForbiddenException(this.i18n.t('locale.PublicMessages.AccessDenied', {
				lang: I18nContext?.current()?.lang
			}));
		}

		return true
	}

	/**
	 * Retrieves the user along with their role and permissions.
	 * @param {number} userId - The ID of the user.
	 * @returns {Promise<UserEntity | null>} - The user entity if found, otherwise null.
	 */
	private async getUserWithRole(userId?: number): Promise<UserEntity | null> {
		if (!userId) return null;
		return this.userRepo.findOne({
			where: { id: userId },
			relations: ["role", "role.permissions"],
		});
	}
}
