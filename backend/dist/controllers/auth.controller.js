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
exports.logout = exports.refreshToken = exports.login = exports.register = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const auth_utils_1 = require("../utils/auth.utils");
const error_middleware_1 = require("../middleware/error.middleware");
const zod_1 = require("zod");
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = registerSchema.parse(req.body);
        const existingUser = yield prisma_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new error_middleware_1.AppError('User already exists', 400);
        }
        const hashed = yield (0, auth_utils_1.hashPassword)(password);
        const user = yield prisma_1.default.user.create({
            data: { email, password: hashed },
        });
        const accessToken = (0, auth_utils_1.generateAccessToken)(user.id);
        const refreshToken = (0, auth_utils_1.generateRefreshToken)(user.id);
        res.status(201).json({
            message: 'User registered successfully',
            accessToken,
            refreshToken,
            user: { id: user.id, email: user.email },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.register = register;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const user = yield prisma_1.default.user.findUnique({ where: { email } });
        if (!user || !(yield (0, auth_utils_1.comparePassword)(password, user.password))) {
            throw new error_middleware_1.AppError('Invalid credentials', 401);
        }
        const accessToken = (0, auth_utils_1.generateAccessToken)(user.id);
        const refreshToken = (0, auth_utils_1.generateRefreshToken)(user.id);
        res.status(200).json({
            message: 'Login successful',
            accessToken,
            refreshToken,
            user: { id: user.id, email: user.email },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.login = login;
const refreshToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.body;
        if (!token)
            throw new error_middleware_1.AppError('Refresh Token Required', 401);
        const decoded = (0, auth_utils_1.verifyRefreshToken)(token);
        const user = yield prisma_1.default.user.findUnique({ where: { id: decoded.userId } });
        if (!user)
            throw new error_middleware_1.AppError('User not found', 404);
        const newAccessToken = (0, auth_utils_1.generateAccessToken)(user.id);
        res.status(200).json({
            accessToken: newAccessToken,
        });
    }
    catch (error) {
        next(new error_middleware_1.AppError('Invalid Refresh Token', 403));
    }
});
exports.refreshToken = refreshToken;
// Logout is handled client-side by discarding tokens using JWT
const logout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({ message: 'Logged out successfully' });
});
exports.logout = logout;
