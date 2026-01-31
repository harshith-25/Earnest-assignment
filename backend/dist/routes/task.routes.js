"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const task_controller_1 = require("../controllers/task.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken); // Protect all task routes
router.get('/', task_controller_1.getTasks);
router.post('/', task_controller_1.createTask);
router.get('/:id', task_controller_1.getTaskById);
router.patch('/:id', task_controller_1.updateTask);
router.patch('/:id/toggle', task_controller_1.toggleTaskStatus);
router.delete('/:id', task_controller_1.deleteTask);
exports.default = router;
