import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import { hashPassword, comparePassword, generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/auth.utils';
import { AppError } from '../middleware/error.middleware';
import { z } from 'zod';

const registerSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
});

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string(),
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { email, password } = registerSchema.parse(req.body);

		const existingUser = await prisma.user.findUnique({ where: { email } });
		if (existingUser) {
			throw new AppError('User already exists', 400);
		}

		const hashed = await hashPassword(password);
		const user = await prisma.user.create({
			data: { email, password: hashed },
		});

		const accessToken = generateAccessToken(user.id);
		const refreshToken = generateRefreshToken(user.id);

		res.status(201).json({
			message: 'User registered successfully',
			accessToken,
			refreshToken,
			user: { id: user.id, email: user.email },
		});
	} catch (error) {
		next(error);
	}
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { email, password } = loginSchema.parse(req.body);

		const user = await prisma.user.findUnique({ where: { email } });
		if (!user || !(await comparePassword(password, user.password))) {
			throw new AppError('Invalid credentials', 401);
		}

		const accessToken = generateAccessToken(user.id);
		const refreshToken = generateRefreshToken(user.id);

		res.status(200).json({
			message: 'Login successful',
			accessToken,
			refreshToken,
			user: { id: user.id, email: user.email },
		});
	} catch (error) {
		next(error);
	}
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { token } = req.body;
		if (!token) throw new AppError('Refresh Token Required', 401);

		const decoded = verifyRefreshToken(token);
		const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

		if (!user) throw new AppError('User not found', 404);

		const newAccessToken = generateAccessToken(user.id);

		res.status(200).json({
			accessToken: newAccessToken,
		});
	} catch (error) {
		next(new AppError('Invalid Refresh Token', 403));
	}
};

// Logout is handled client-side by discarding tokens using JWT
export const logout = async (req: Request, res: Response, next: NextFunction) => {
	res.status(200).json({ message: 'Logged out successfully' });
};
