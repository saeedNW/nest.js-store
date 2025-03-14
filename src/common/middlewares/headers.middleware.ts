import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to modify response headers
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 * @param {NextFunction} next - Next function
 */
export function customHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
	res.setHeader("X-Powered-By", "Python 3.13.2"); // Fake the technology stack
	res.setHeader("Server", "Gunicorn/20.1.0"); // Mimic a Python server
	next();
}
