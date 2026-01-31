"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const auth_utils_1 = require("../utils/auth.utils");
const error_middleware_1 = require("./error.middleware");
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return next(new error_middleware_1.AppError('Access Token Required', 401));
    }
    try {
        const decoded = (0, auth_utils_1.verifyAccessToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        return next(new error_middleware_1.AppError('Invalid or Expired Token', 403));
    }
};
exports.authenticateToken = authenticateToken;
