import { defineStore } from 'pinia';
import api from '../api/axios';

export const useCartStore = defineStore('cart', {
    state: () => ({
        items: [],
        totalCount: 0,
        totalPrice: 0,
        loading: false,
    }),
    actions: {
        async fetchCart() {
            this.loading = true;
            try {
                const response = await api.get('cart/');
                this.items = response.data.items || [];
                this.totalCount = response.data.total_count || 0;
                this.totalPrice = response.data.total_price || 0;
            } catch (error) {
                console.error('Fetch cart failed:', error);
            } finally {
                this.loading = false;
            }
        },
        async addToCart(productId, quantity = 1) {
            try {
                await api.post('cart/add_item/', {
                    product_id: productId,
                    quantity: quantity
                });
                await this.fetchCart();
                return true;
            } catch (error) {
                console.error('Add to cart failed:', error);
                throw error;
            }
        },
        async updateQuantity(itemId, quantity) {
            try {
                await api.put(`cart/update_item/${itemId}/`, { quantity });
                await this.fetchCart();
            } catch (error) {
                console.error('Update quantity failed:', error);
                throw error;
            }
        },
        async removeItem(itemId) {
            try {
                await api.delete(`cart/remove_item/${itemId}/`);
                await this.fetchCart();
            } catch (error) {
                console.error('Remove item failed:', error);
                throw error;
            }
        },
        async clearCart() {
            try {
                await api.post('cart/clear/');
                await this.fetchCart();
            } catch (error) {
                console.error('Clear cart failed:', error);
            }
        }
    }
});

export const useOrderStore = defineStore('order', {
    state: () => ({
        orders: [],
        currentOrder: null,
        loading: false,
    }),
    actions: {
        async fetchOrders(status = null) {
            this.loading = true;
            try {
                const params = status ? { status } : {};
                const response = await api.get('orders/', { params });
                this.orders = response.data;
            } catch (error) {
                console.error('Fetch orders failed:', error);
            } finally {
                this.loading = false;
            }
        },
        async fetchOrder(id) {
            this.loading = true;
            try {
                const response = await api.get(`orders/${id}/`);
                this.currentOrder = response.data;
            } catch (error) {
                console.error('Fetch order failed:', error);
            } finally {
                this.loading = false;
            }
        },
        async createOrder(addressId, items) {
            return api.post('orders/', {
                address_id: addressId,
                items: items
            });
        },
        async payOrder(orderId) {
            return api.post(`orders/${orderId}/pay/`);
        },
        async cancelOrder(orderId) {
            return api.post(`orders/${orderId}/cancel/`);
        },
        async confirmOrder(orderId) {
            return api.post(`orders/${orderId}/confirm/`);
        }
    }
});

export const useAddressStore = defineStore('address', {
    state: () => ({
        addresses: [],
        loading: false,
    }),
    getters: {
        defaultAddress: (state) => state.addresses.find(addr => addr.is_default),
    },
    actions: {
        async fetchAddresses() {
            this.loading = true;
            try {
                const response = await api.get('addresses/');
                this.addresses = response.data;
            } catch (error) {
                console.error('Fetch addresses failed:', error);
            } finally {
                this.loading = false;
            }
        },
        async createAddress(data) {
            return api.post('addresses/', data);
        },
        async updateAddress(id, data) {
            return api.put(`addresses/${id}/`, data);
        },
        async deleteAddress(id) {
            return api.delete(`addresses/${id}/`);
        }
    }
});
