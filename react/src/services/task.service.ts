import api from './api';
import type { Task, TasksResponse } from '../types';

export const getTasks = async (page = 1, status?: string, search?: string): Promise<TasksResponse> => {
	const params: any = { page, limit: 10 };
	if (status) params.status = status;
	if (search) params.search = search;
	const { data } = await api.get<TasksResponse>('/tasks', { params });
	return data;
};

export const createTask = async (title: string, description?: string, status?: string): Promise<Task> => {
	const { data } = await api.post<Task>('/tasks', { title, description, status });
	return data;
};

export const updateTask = async (id: string, updates: Partial<Task>): Promise<Task> => {
	const { data } = await api.patch<Task>(`/tasks/${id}`, updates);
	return data;
};

export const toggleTaskStatus = async (id: string): Promise<Task> => {
	const { data } = await api.patch<Task>(`/tasks/${id}/toggle`);
	return data;
};

export const deleteTask = async (id: string): Promise<void> => {
	await api.delete(`/tasks/${id}`);
};
