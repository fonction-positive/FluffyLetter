import { defineStore } from 'pinia';
import api from '../api/axios';
import { mockProducts } from '../mock/products';

export const useProductStore = defineStore('product', {
    state: () => ({
        products: [],
        categories: [],
        currentProduct: null,
        loading: false,
        useMockData: false, // 是否使用模拟数据
    }),
    actions: {
        async fetchCategories() {
            try {
                const response = await api.get('categories/');
                this.categories = response.data;
                this.useMockData = false;
            } catch (error) {
                console.warn('Fetch categories failed, using mock data:', error);
                this.useMockData = true;
            }
        },
        async fetchProducts(params = {}) {
            this.loading = true;
            try {
                const response = await api.get('products/', { params });
                this.products = response.data;
                this.useMockData = false;
            } catch (error) {
                console.warn('Fetch products failed, using mock data:', error);
                // 使用模拟数据
                this.useMockData = true;
                let filteredProducts = [...mockProducts];
                
                // 根据分类筛选
                if (params.category && params.category !== 'all') {
                    filteredProducts = filteredProducts.filter(
                        p => p.category === params.category
                    );
                }
                
                this.products = filteredProducts;
            } finally {
                this.loading = false;
            }
        },
        async fetchProduct(id) {
            this.loading = true;
            try {
                const response = await api.get(`products/${id}/`);
                this.currentProduct = response.data;
                this.useMockData = false;
            } catch (error) {
                console.warn('Fetch product failed, using mock data:', error);
                // 使用模拟数据
                this.useMockData = true;
                this.currentProduct = mockProducts.find(p => p.id === parseInt(id)) || null;
            } finally {
                this.loading = false;
            }
        },
    }
});

