import { Request, Response, NextFunction } from 'express';

// Custom Error Class
export class AppError extends Error {
	statusCode: number;

	constructor(message: string, statusCode: number) {
		super(message);
		this.statusCode = statusCode;
		Error.captureStackTrace(this, this.constructor);
	}
}

// Global Error Handler
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
	const statusCode = err.statusCode || 500;
	const message = err.message || 'Internal Server Error';

	console.error(`[Error] ${statusCode} - ${message}`);
	if (err.stack) console.error(err.stack);

	res.status(statusCode).json({
		success: false,
		error: message,
	});
};