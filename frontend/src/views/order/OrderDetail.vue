<template>
  <div class="order-detail-page" v-if="orderStore.currentOrder">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <el-button text @click="$router.back()" class="back-button">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h1 class="page-title">订单详情</h1>
      </div>
    </header>

    <!-- Order Content -->
    <div class="order-container">
      <!-- Status Section -->
      <div class="section status-section">
        <el-result 
          :icon="getStatusIcon(orderStore.currentOrder.status)"
          :title="orderStore.currentOrder.status_display"
        >
          <template #sub-title>
            <p>订单号：{{ orderStore.currentOrder.order_no }}</p>
            <p>下单时间：{{ formatDate(orderStore.currentOrder.created_at) }}</p>
          </template>
        </el-result>
      </div>

      <!-- Address Section -->
      <div class="section">
        <h2 class="section-title">收货信息</h2>
        <div class="address-info">
          <div class="info-row">
            <span class="label">收货人：</span>
            <span>{{ orderStore.currentOrder.shipping_name }}</span>
          </div>
          <div class="info-row">
            <span class="label">联系电话：</span>
            <span>{{ orderStore.currentOrder.shipping_phone }}</span>
          </div>
          <div class="info-row">
            <span class="label">收货地址：</span>
            <span>
              {{ orderStore.currentOrder.shipping_province }}
              {{ orderStore.currentOrder.shipping_city }}
              {{ orderStore.currentOrder.shipping_district }}
              {{ orderStore.currentOrder.shipping_address }}
            </span>
          </div>
          <div v-if="orderStore.currentOrder.tracking_no" class="info-row">
            <span class="label">物流单号：</span>
            <span>{{ orderStore.currentOrder.tracking_no }}</span>
          </div>
        </div>
      </div>

      <!-- Items Section -->
      <div class="section">
        <h2 class="section-title">商品清单</h2>
        <div class="items-list">
          <div v-for="item in orderStore.currentOrder.items" :key="item.id" class="item-row">
            <div class="item-info">
              <h3>{{ item.product_name }}</h3>
              <p>¥{{ item.price }} × {{ item.quantity }}</p>
            </div>
            <div class="item-subtotal">¥{{ item.subtotal }}</div>
          </div>
        </div>
      </div>

      <!-- Summary Section -->
      <div class="section summary-section">
        <div class="summary-row">
          <span>商品总价</span>
          <span>¥{{ orderStore.currentOrder.total_amount }}</span>
        </div>
        <div class="summary-row total">
          <span>实付金额</span>
          <span class="total-price">¥{{ orderStore.currentOrder.total_amount }}</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions-section">
        <el-button 
          v-if="orderStore.currentOrder.status === 'pending'"
          type="primary"
          size="large"
          @click="handlePay"
        >
          去支付
        </el-button>
        <el-button 
          v-if="orderStore.currentOrder.status === 'pending' || orderStore.currentOrder.status === 'paid'"
          size="large"
          @click="handleCancel"
        >
          取消订单
        </el-button>
        <el-button 
          v-if="orderStore.currentOrder.status === 'shipped'"
          type="primary"
          size="large"
          @click="handleConfirm"
        >
          确认收货
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useOrderStore } from '../../stores/cart';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';

const orderStore = useOrderStore();
const route = useRoute();
const router = useRouter();

onMounted(() => {
  orderStore.fetchOrder(route.params.id);
});

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN');
};

const getStatusIcon = (status) => {
  const iconMap = {
    pending: 'warning',
    paid: 'info',
    shipped: 'info',
    completed: 'success',
    cancelled: 'error'
  };
  return iconMap[status] || 'info';
};

const handlePay = async () => {
  try {
    await orderStore.payOrder(route.params.id);
    ElMessage.success('支付成功');
    orderStore.fetchOrder(route.params.id);
  } catch (error) {
    ElMessage.error('支付失败');
  }
};

const handleCancel = () => {
  ElMessageBox.confirm('确定要取消这个订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await orderStore.cancelOrder(route.params.id);
      ElMessage.success('订单已取消');
      orderStore.fetchOrder(route.params.id);
    } catch (error) {
      ElMessage.error('取消失败');
    }
  }).catch(() => {});
};

const handleConfirm = async () => {
  try {
    await orderStore.confirmOrder(route.params.id);
    ElMessage.success('确认收货成功');
    orderStore.fetchOrder(route.params.id);
  } catch (error) {
    ElMessage.error('操作失败');
  }
};
</script>

<style scoped>
.order-detail-page {
  min-height: 100vh;
  background-color: var(--color-bg-secondary);
}

.header {
  background-color: var(--color-bg-primary);
  border-bottom: 1px solid var(--color-border);
}

.header-content {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--spacing-md) var(--spacing-xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.back-button {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-primary);
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
}

.order-container {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--spacing-2xl) var(--spacing-xl);
}

.section {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.status-section {
  text-align: center;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: var(--spacing-lg);
}

.address-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.info-row {
  display: flex;
  font-size: 15px;
  line-height: 1.6;
}

.label {
  color: var(--color-text-secondary);
  min-width: 100px;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.item-info h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
}

.item-info p {
  color: var(--color-text-secondary);
  font-size: 14px;
}

.item-subtotal {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-price);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-md) 0;
  font-size: 15px;
}

.summary-row.total {
  border-top: 1px solid var(--color-border);
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-lg);
  font-size: 17px;
  font-weight: 600;
}

.total-price {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-price);
}

.actions-section {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}
</style>
