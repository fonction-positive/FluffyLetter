import { defineStore } from 'pinia';
import api from '../api/axios';

export const useUserStore = defineStore('user', {
    state: () => ({
        user: null,
        accessToken: localStorage.getItem('access_token') || null,
        refreshToken: localStorage.getItem('refresh_token') || null,
    }),
    getters: {
        isAuthenticated: (state) => !!state.accessToken,
        isAdmin: (state) => state.user?.role === 'admin',
    },
    actions: {
        async login(username, password) {
            try {
                const response = await api.post('auth/login/', { username, password });
                const { access, refresh } = response.data;
                this.accessToken = access;
                this.refreshToken = refresh;
                localStorage.setItem('access_token', access);
                localStorage.setItem('refresh_token', refresh);
                await this.fetchUser();
                return true;
            } catch (error) {
                console.error('Login failed:', error);
                throw error;
            }
        },
        async register(userData) {
            try {
                await api.post('auth/register/', userData);
                return true;
            } catch (error) {
                console.error('Registration failed:', error);
                throw error;
            }
        },
        async fetchUser() {
            try {
                const response = await api.get('auth/me/');
                this.user = response.data;
            } catch (error) {
                console.error('Fetch user failed:', error);
            }
        },
        logout() {
            this.user = null;
            this.accessToken = null;
            this.refreshToken = null;
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
        }
    }
});
