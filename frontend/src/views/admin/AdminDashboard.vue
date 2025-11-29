<template>
  <div class="admin-dashboard">
    <!-- Header -->
    <header class="admin-header">
      <div class="title-row">
        <el-button text @click="$router.back()" class="back-button">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h1 class="page-title">数据统计</h1>
      </div>
    </header>

    <!-- Stats Cards -->
    <div class="stats-grid" v-loading="loading">
      <div class="stat-card">
        <div class="stat-icon sales">
          <el-icon :size="32"><Money /></el-icon>
        </div>
        <div class="stat-info">
          <p class="stat-label">总销售额</p>
          <h2 class="stat-value">¥{{ stats.total_sales?.toFixed(2) || 0 }}</h2>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon orders">
          <el-icon :size="32"><Document /></el-icon>
        </div>
        <div class="stat-info">
          <p class="stat-label">订单总数</p>
          <h2 class="stat-value">{{ stats.order_stats?.total || 0 }}</h2>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon users">
          <el-icon :size="32"><User /></el-icon>
        </div>
        <div class="stat-info">
          <p class="stat-label">用户总数</p>
          <h2 class="stat-value">{{ stats.user_stats?.total || 0 }}</h2>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon pending">
          <el-icon :size="32"><Clock /></el-icon>
        </div>
        <div class="stat-info">
          <p class="stat-label">待处理订单</p>
          <h2 class="stat-value">{{ stats.order_stats?.paid || 0 }}</h2>
        </div>
      </div>
    </div>

    <!-- Recent Orders -->
    <div class="section">
      <h2 class="section-title">最近订单</h2>
      <el-table :data="stats.recent_orders" style="width: 100%">
        <el-table-column prop="order_no" label="订单号" width="180" />
        <el-table-column prop="total_amount" label="金额" width="120">
          <template #default="scope">
            <span class="price-text">¥{{ scope.row.total_amount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ scope.row.status_display }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="下单时间">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api/axios';
import { Money, Document, User, Clock, ArrowLeft } from '@element-plus/icons-vue';

const stats = ref({});
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  try {
    const response = await api.get('admin/stats/');
    stats.value = response.data;
  } catch (error) {
    console.error('Failed to fetch stats:', error);
  } finally {
    loading.value = false;
  }
});

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN');
};

const getStatusType = (status) => {
  const typeMap = {
    pending: 'warning',
    paid: 'primary',
    shipped: 'info',
    completed: 'success',
    cancelled: 'danger'
  };
  return typeMap[status] || 'info';
};
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background-color: var(--color-bg-secondary);
  padding: var(--spacing-xl);
}

.admin-header {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
}

.title-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
  margin: 0;
}

.back-button {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-primary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.stat-card {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.sales {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.orders {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.users {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.pending {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}

.section {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: var(--spacing-lg);
}

.price-text {
  color: var(--color-price);
  font-weight: 600;
}
</style>
