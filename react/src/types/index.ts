export interface User {
	id: string;
	email: string;
}

export interface AuthResponse {
	message?: string;
	accessToken: string;
	refreshToken?: string;
	user: User;
}

export interface Task {
	id: string;
	title: string;
	description?: string;
	status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
	createdAt: string;
	updatedAt: string;
}

export interface MetaPagination {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface TasksResponse {
	tasks: Task[];
	pagination: MetaPagination;
}
