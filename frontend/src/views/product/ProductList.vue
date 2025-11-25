<template>
  <div class="product-list-page">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <div class="logo">StoreWeb</div>
        <div class="search-container">
          <el-input 
            v-model="searchQuery" 
            placeholder="搜索商品..." 
            @input="handleSearch" 
            clearable
            size="large"
            class="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="header-actions">
          <el-badge :value="cartStore.totalCount" :hidden="cartStore.totalCount === 0" class="cart-badge">
            <el-button circle @click="$router.push('/cart')">
              <el-icon :size="20"><ShoppingCart /></el-icon>
            </el-button>
          </el-badge>
          <el-button v-if="!userStore.isAuthenticated" text @click="$router.push('/login')">登录</el-button>
          <el-dropdown v-else trigger="click">
            <div class="user-menu-trigger">
              <el-icon :size="20"><User /></el-icon>
              <span class="user-name">{{ userStore.user?.username }}</span>
              <el-icon :size="16"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="$router.push('/user/orders')">
                  <el-icon><List /></el-icon>
                  我的订单
                </el-dropdown-item>
                <el-dropdown-item v-if="userStore.isAdmin" divided @click="$router.push('/admin/dashboard')">
                  <el-icon><DataAnalysis /></el-icon>
                  数据统计
                </el-dropdown-item>
                <el-dropdown-item v-if="userStore.isAdmin" @click="$router.push('/admin/products')">
                  <el-icon><Goods /></el-icon>
                  商品管理
                </el-dropdown-item>
                <el-dropdown-item v-if="userStore.isAdmin" @click="$router.push('/admin/orders')">
                  <el-icon><Document /></el-icon>
                  订单管理
                </el-dropdown-item>
                <el-dropdown-item v-if="userStore.isAdmin" @click="$router.push('/admin/users')">
                  <el-icon><User /></el-icon>
                  用户管理
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Sidebar Categories -->
      <aside class="sidebar">
        <h3 class="sidebar-title">分类</h3>
        <el-menu @select="handleCategorySelect" :default-active="selectedCategory">
          <el-menu-item index="all">全部商品</el-menu-item>
          <el-menu-item v-for="cat in productStore.categories" :key="cat.id" :index="String(cat.id)">
            {{ cat.name }}
          </el-menu-item>
        </el-menu>
      </aside>

      <!-- Products Grid -->
      <div class="products-section">
        <h1 class="section-title">精选商品</h1>
        
        <div v-loading="productStore.loading" class="products-grid">
          <div 
            v-for="product in productStore.products" 
            :key="product.id" 
            class="product-card"
            @click="goToDetail(product.id)"
          >
            <div class="product-image-wrapper">
              <img 
                v-if="product.main_image" 
                :src="product.main_image.image" 
                :alt="product.name"
                class="product-image" 
              />
              <div v-else class="product-image-placeholder">
                <el-icon :size="48"><Picture /></el-icon>
              </div>
            </div>
            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-price">¥{{ product.price }}</p>
            </div>
          </div>
        </div>

        <el-empty 
          v-if="!productStore.loading && productStore.products.length === 0" 
          description="暂无商品"
          :image-size="120"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useProductStore } from '../../stores/product';
import { useUserStore } from '../../stores/user';
import { useCartStore } from '../../stores/cart';
import { useRouter } from 'vue-router';
import { Search, Picture, ShoppingCart, User, ArrowDown, List, Setting, SwitchButton, DataAnalysis, Goods, Document } from '@element-plus/icons-vue';

const productStore = useProductStore();
const userStore = useUserStore();
const cartStore = useCartStore();
const router = useRouter();
const searchQuery = ref('');
const selectedCategory = ref('all');

onMounted(() => {
  productStore.fetchCategories();
  productStore.fetchProducts();
  if (userStore.isAuthenticated) {
    if (!userStore.user) {
      userStore.fetchUser();
    }
    cartStore.fetchCart();
  }
});

const handleCategorySelect = (index) => {
  selectedCategory.value = index;
  const params = {};
  if (index !== 'all') {
    params.category = index;
  }
  productStore.fetchProducts(params);
};

const handleSearch = () => {
  if (window.searchTimeout) clearTimeout(window.searchTimeout);
  window.searchTimeout = setTimeout(() => {
    productStore.fetchProducts({ search: searchQuery.value });
  }, 500);
};

const goToDetail = (id) => {
  router.push(`/product/${id}`);
};

const handleLogout = () => {
  userStore.logout();
  router.push('/');
};
</script>

<style scoped>
.product-list-page {
  min-height: 100vh;
  background-color: var(--color-bg-secondary);
}

/* Header */
.header {
  background-color: var(--color-bg-primary);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(20px);
  background-color: rgba(255, 255, 255, 0.8);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--spacing-md) var(--spacing-xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
}

.logo {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
  white-space: nowrap;
}

.search-container {
  flex: 1;
  max-width: 600px;
}

.search-input {
  --el-input-border-radius: 20px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.user-menu-trigger {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  cursor: pointer;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-sm);
  transition: background-color 0.2s;
}

.user-menu-trigger:hover {
  background-color: var(--color-bg-secondary);
}

.user-name {
  font-weight: 500;
  color: var(--color-text-primary);
}

/* Main Content */
.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--spacing-2xl) var(--spacing-xl);
  display: flex;
  gap: var(--spacing-2xl);
}

/* Sidebar */
.sidebar {
  width: 200px;
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: var(--spacing-lg);
  color: var(--color-text-primary);
}

/* Products Section */
.products-section {
  flex: 1;
}

.section-title {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: var(--spacing-xl);
  color: var(--color-text-primary);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--spacing-lg);
}

/* Product Card */
.product-card {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-sm);
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.product-image-wrapper {
  width: 100%;
  height: 260px;
  overflow: hidden;
  background-color: var(--color-bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.product-image-placeholder {
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.product-info {
  padding: var(--spacing-md) var(--spacing-lg);
}

.product-name {
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-price);
  letter-spacing: -0.01em;
}

/* Responsive */
@media (max-width: 1024px) {
  .sidebar {
    display: none;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-wrap: wrap;
    padding: var(--spacing-md);
  }
  
  .search-container {
    order: 3;
    width: 100%;
    max-width: 100%;
    margin-top: var(--spacing-sm);
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: var(--spacing-md);
  }
  
  .main-content {
    padding: var(--spacing-lg) var(--spacing-md);
  }
}
</style>
