import axios from 'axios';

const API_URL = 'http://localhost:9000';

const api = axios.create({
	baseURL: API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Request Interceptor: Attach Access Token
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('accessToken');
		if (token) {
			config.headers['Authorization'] = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Refresh
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		// Prevent infinite loop
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;
			const refreshToken = localStorage.getItem('refreshToken');

			if (refreshToken) {
				try {
					const { data } = await axios.post(`${API_URL}/auth/refresh`, { token: refreshToken });
					localStorage.setItem('accessToken', data.accessToken);
					api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
					return api(originalRequest);
				} catch (refreshError) {
					// Logout if refresh fails
					localStorage.removeItem('accessToken');
					localStorage.removeItem('refreshToken');
					localStorage.removeItem('user');
					window.location.href = '/login';
				}
			} else {
				localStorage.removeItem('user');
				window.location.href = '/login';
			}
		}
		return Promise.reject(error);
	}
);

export default api;
