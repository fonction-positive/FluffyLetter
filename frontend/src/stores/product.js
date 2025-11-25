import { defineStore } from 'pinia';
import api from '../api/axios';

export const useProductStore = defineStore('product', {
    state: () => ({
        products: [],
        categories: [],
        currentProduct: null,
        loading: false,
    }),
    actions: {
        async fetchCategories() {
            try {
                const response = await api.get('categories/');
                this.categories = response.data;
            } catch (error) {
                console.error('Fetch categories failed:', error);
            }
        },
        async fetchProducts(params = {}) {
            this.loading = true;
            try {
                const response = await api.get('products/', { params });
                this.products = response.data;
            } catch (error) {
                console.error('Fetch products failed:', error);
            } finally {
                this.loading = false;
            }
        },
        async fetchProduct(id) {
            this.loading = true;
            try {
                const response = await api.get(`products/${id}/`);
                this.currentProduct = response.data;
            } catch (error) {
                console.error('Fetch product failed:', error);
            } finally {
                this.loading = false;
            }
        },
        // Admin actions
        async createProduct(data) {
            return api.post('admin/products/', data);
        },
        async updateProduct(id, data) {
            return api.put(`admin/products/${id}/`, data);
        },
        async deleteProduct(id) {
            return api.delete(`admin/products/${id}/`);
        }
    }
});
