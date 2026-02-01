import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/auth.utils';
import { AppError } from './error.middleware';

export interface AuthRequest extends Request {
	user?: { userId: string };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	if (!token) {
		return next(new AppError('Access Token Required', 401));
	}

	try {
		const decoded = verifyAccessToken(token);
		req.user = decoded;
		next();
	} catch (error) {
		return next(new AppError('Invalid or Expired Token', 403));
	}
};