import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 9000;

app.use(helmet());
app.use(cors({
	origin: ['http://localhost:5173', 'http://localhost:5174'],
	credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

// Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`);
});
