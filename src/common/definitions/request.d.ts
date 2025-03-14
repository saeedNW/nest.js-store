import { UserEntity } from "src/modules/user/entities/user.entity";

/** Declare a global module augmentation */
declare global {
	// Extend the Express namespace
	namespace Express {
		// Extend the Request interface within the Express namespace
		interface Request {
			// Add an optional `user` property to the Request interface
			user?: UserEntity;
		}
	}
}

declare module "express-serve-static-core" {
	export interface Request {
		user?: UserEntity;
	}
}
