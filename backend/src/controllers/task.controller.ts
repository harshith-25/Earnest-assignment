import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import { z } from 'zod';

const createTaskSchema = z.object({
	title: z.string().min(1),
	description: z.string().optional(),
	status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
});

const updateTaskSchema = z.object({
	title: z.string().min(1).optional(),
	description: z.string().optional(),
	status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
});

export const getTasks = async (req: AuthRequest, res: Response, next: NextFunction) => {
	try {
		const userId = req.user!.userId;
		const { page = 1, limit = 10, status, search } = req.query;

		const skip = (Number(page) - 1) * Number(limit);
		const take = Number(limit);

		const where: any = { userId };
		if (status) where.status = status;
		if (search) where.title = { contains: String(search) };

		const [tasks, total] = await Promise.all([
			prisma.task.findMany({
				where,
				skip,
				take,
				orderBy: { createdAt: 'desc' },
			}),
			prisma.task.count({ where }),
		]);

		res.json({
			tasks,
			pagination: {
				total,
				page: Number(page),
				limit: Number(limit),
				totalPages: Math.ceil(total / Number(limit)),
			},
		});
	} catch (error) {
		next(error);
	}
};

export const getTaskById = async (req: AuthRequest, res: Response, next: NextFunction) => {
	try {
		const userId = req.user!.userId;
		const id = req.params.id as string;

		const task = await prisma.task.findFirst({
			where: { id, userId },
		});

		if (!task) throw new AppError('Task not found', 404);

		res.json(task);
	} catch (error) {
		next(error);
	}
};

export const createTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
	try {
		const userId = req.user!.userId;
		const data = createTaskSchema.parse(req.body);

		const task = await prisma.task.create({
			data: { ...data, userId },
		});

		res.status(201).json(task);
	} catch (error) {
		next(error);
	}
};

export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
	try {
		const userId = req.user!.userId;
		const id = req.params.id as string;
		const data = updateTaskSchema.parse(req.body);

		const task = await prisma.task.findFirst({ where: { id, userId } });
		if (!task) throw new AppError('Task not found', 404);

		const updatedTask = await prisma.task.update({
			where: { id },
			data,
		});

		res.json(updatedTask);
	} catch (error) {
		next(error);
	}
};

export const toggleTaskStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
	try {
		const userId = req.user!.userId;
		const id = req.params.id as string;

		const task = await prisma.task.findFirst({ where: { id, userId } });
		if (!task) throw new AppError('Task not found', 404);

		const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
		const updatedTask = await prisma.task.update({
			where: { id },
			data: { status: newStatus },
		});

		res.json(updatedTask);
	} catch (error) {
		next(error);
	}
};

export const deleteTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
	try {
		const userId = req.user!.userId;
		const id = req.params.id as string;

		const task = await prisma.task.findFirst({ where: { id, userId } });
		if (!task) throw new AppError('Task not found', 404);

		await prisma.task.delete({ where: { id } });

		res.json({ message: 'Task deleted successfully' });
	} catch (error) {
		next(error);
	}
};
