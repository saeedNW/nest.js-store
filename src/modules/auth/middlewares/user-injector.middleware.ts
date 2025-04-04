import { Injectable, NestMiddleware } from "@nestjs/common";
import { isJWT } from "class-validator";
import { NextFunction, Request, Response } from "express";
import { AuthService } from "src/modules/auth/auth.service";

@Injectable()
export class UserInjector implements NestMiddleware {
	constructor(private authService: AuthService) { }

	/**
	 * Middleware to inject user data into the request object
	 * @param req - The incoming request object
	 * @param res - The response object
	 * @param next - The next function
	 */
	async use(req: Request, res: Response, next: NextFunction) {
		// retrieve token from client's request
		const token: string | null = this.extractToken(req);

		// Proceed to nest method if the token was not found
		if (!token) return next();

		try {
			// Validate access token
			let user = await this.authService.validateAccessToken(token);
			// Add user data to request if user was found
			if (user) req.user = user;
		} catch (error) {
			console.log(error);
		}

		next();
	}

	/**
	 * Extracts the access token from the `Authorization` header
	 * @param {Request} request - The incoming request object
	 * @returns {string | null} The extracted JWT token
	 */
	protected extractToken(request: Request): string | null {
		// retrieve authorization header from request's headers object
		const { authorization } = request.headers;

		// Return null if authorization header was not set or if it was empty
		if (!authorization || authorization?.trim() == "") {
			return null;
		}

		// separate token from bearer keyword
		const [bearer, token] = authorization?.split(" ");

		// Return null if the bearer keyword or the token were invalid
		if (bearer?.toLowerCase() !== "bearer" || !token || !isJWT(token)) {
			return null;
		}

		// return the access token
		return token;
	}
}
