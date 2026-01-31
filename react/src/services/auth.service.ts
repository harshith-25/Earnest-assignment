import api from './api';
import type { AuthResponse } from '../types';

export const register = async (email: string, password: string): Promise<AuthResponse> => {
	const { data } = await api.post<AuthResponse>('/auth/register', { email, password });
	return data;
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
	const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
	return data;
};

export const logout = async (): Promise<void> => {
	await api.post('/auth/logout');
};
