"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.toggleTaskStatus = exports.updateTask = exports.createTask = exports.getTaskById = exports.getTasks = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const error_middleware_1 = require("../middleware/error.middleware");
const zod_1 = require("zod");
const createTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    status: zod_1.z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
});
const updateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional(),
    status: zod_1.z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
});
const getTasks = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { page = 1, limit = 10, status, search } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);
        const where = { userId };
        if (status)
            where.status = status;
        if (search)
            where.title = { contains: String(search) };
        const [tasks, total] = yield Promise.all([
            prisma_1.default.task.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.default.task.count({ where }),
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
    }
    catch (error) {
        next(error);
    }
});
exports.getTasks = getTasks;
const getTaskById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const id = req.params.id;
        const task = yield prisma_1.default.task.findFirst({
            where: { id, userId },
        });
        if (!task)
            throw new error_middleware_1.AppError('Task not found', 404);
        res.json(task);
    }
    catch (error) {
        next(error);
    }
});
exports.getTaskById = getTaskById;
const createTask = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const data = createTaskSchema.parse(req.body);
        const task = yield prisma_1.default.task.create({
            data: Object.assign(Object.assign({}, data), { userId }),
        });
        res.status(201).json(task);
    }
    catch (error) {
        next(error);
    }
});
exports.createTask = createTask;
const updateTask = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const id = req.params.id;
        const data = updateTaskSchema.parse(req.body);
        const task = yield prisma_1.default.task.findFirst({ where: { id, userId } });
        if (!task)
            throw new error_middleware_1.AppError('Task not found', 404);
        const updatedTask = yield prisma_1.default.task.update({
            where: { id },
            data,
        });
        res.json(updatedTask);
    }
    catch (error) {
        next(error);
    }
});
exports.updateTask = updateTask;
const toggleTaskStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const id = req.params.id;
        const task = yield prisma_1.default.task.findFirst({ where: { id, userId } });
        if (!task)
            throw new error_middleware_1.AppError('Task not found', 404);
        const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
        const updatedTask = yield prisma_1.default.task.update({
            where: { id },
            data: { status: newStatus },
        });
        res.json(updatedTask);
    }
    catch (error) {
        next(error);
    }
});
exports.toggleTaskStatus = toggleTaskStatus;
const deleteTask = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const id = req.params.id;
        const task = yield prisma_1.default.task.findFirst({ where: { id, userId } });
        if (!task)
            throw new error_middleware_1.AppError('Task not found', 404);
        yield prisma_1.default.task.delete({ where: { id } });
        res.json({ message: 'Task deleted successfully' });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteTask = deleteTask;
