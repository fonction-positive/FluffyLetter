<template>
  <div class="admin-order-page">
    <!-- Header -->
    <header class="admin-header">
      <div class="header-content">
        <div class="title-row">
          <el-button text @click="$router.back()" class="back-button">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
          <h1 class="page-title">订单管理</h1>
        </div>
      </div>
    </header>

    <!-- Filter Tabs -->
    <div class="tabs-container">
      <div class="tabs">
        <div 
          v-for="tab in tabs" 
          :key="tab.value"
          :class="['tab', { active: currentTab === tab.value }]"
          @click="handleTabChange(tab.value)"
        >
          {{ tab.label }}
        </div>
      </div>
    </div>

    <!-- Orders Table -->
    <div class="table-container">
      <el-table 
        :data="orders" 
        style="width: 100%" 
        v-loading="loading"
        :header-cell-style="{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)', fontWeight: '600', fontSize: '13px' }"
      >
        <el-table-column prop="order_no" label="订单号" width="180" />
        <el-table-column prop="user" label="用户ID" width="100" />
        <el-table-column label="收货人" width="120">
          <template #default="scope">
            {{ scope.row.shipping_name }}
          </template>
        </el-table-column>
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
        <el-table-column prop="created_at" label="下单时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button 
              v-if="scope.row.status === 'paid'"
              size="small" 
              type="primary"
              @click="handleShip(scope.row)"
            >
              发货
            </el-button>
            <el-button 
              v-if="scope.row.status !== 'completed' && scope.row.status !== 'cancelled'"
              size="small" 
              type="danger"
              @click="handleCancel(scope.row.id)"
            >
              取消
            </el-button>
            <el-button 
              size="small" 
              text
              @click="showOrderDetail(scope.row)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Ship Dialog -->
    <el-dialog v-model="showShipDialog" title="发货" width="400px">
      <el-form :model="shipForm" label-position="top">
        <el-form-item label="物流单号（可选）">
          <el-input v-model="shipForm.tracking_no" placeholder="请输入物流单号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showShipDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmShip">确认发货</el-button>
      </template>
    </el-dialog>

    <!-- Order Detail Dialog -->
    <el-dialog v-model="showDetailDialog" title="订单详情" width="600px">
      <div v-if="currentOrder" class="order-detail">
        <div class="detail-section">
          <h3>订单信息</h3>
          <p><strong>订单号：</strong>{{ currentOrder.order_no }}</p>
          <p><strong>状态：</strong>{{ currentOrder.status_display }}</p>
          <p><strong>总金额：</strong>¥{{ currentOrder.total_amount }}</p>
        </div>
        <div class="detail-section">
          <h3>收货信息</h3>
          <p><strong>收货人：</strong>{{ currentOrder.shipping_name }}</p>
          <p><strong>电话：</strong>{{ currentOrder.shipping_phone }}</p>
          <p><strong>地址：</strong>{{ currentOrder.shipping_province }} {{ currentOrder.shipping_city }} {{ currentOrder.shipping_district }} {{ currentOrder.shipping_address }}</p>
          <p v-if="currentOrder.tracking_no"><strong>物流单号：</strong>{{ currentOrder.tracking_no }}</p>
        </div>
        <div class="detail-section">
          <h3>商品清单</h3>
          <div v-for="item in currentOrder.items" :key="item.id" class="item-row">
            <span>{{ item.product_name }}</span>
            <span>¥{{ item.price }} × {{ item.quantity }}</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api/axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';

const orders = ref([]);
const loading = ref(false);
const currentTab = ref('all');
const showShipDialog = ref(false);
const showDetailDialog = ref(false);
const currentOrder = ref(null);
const shipForm = ref({
  tracking_no: '',
  orderId: null
});

const tabs = [
  { label: '全部', value: 'all' },
  { label: '待支付', value: 'pending' },
  { label: '待发货', value: 'paid' },
  { label: '已发货', value: 'shipped' },
  { label: '已完成', value: 'completed' },
];

onMounted(() => {
  fetchOrders();
});

const fetchOrders = async (status = null) => {
  loading.value = true;
  try {
    const params = status ? { status } : {};
    const response = await api.get('admin/orders/', { params });
    orders.value = response.data;
  } catch (error) {
    ElMessage.error('获取订单失败');
  } finally {
    loading.value = false;
  }
};

const handleTabChange = (value) => {
  currentTab.value = value;
  const status = value === 'all' ? null : value;
  fetchOrders(status);
};

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

const handleShip = (order) => {
  shipForm.value.orderId = order.id;
  shipForm.value.tracking_no = '';
  showShipDialog.value = true;
};

const confirmShip = async () => {
  try {
    await api.post(`admin/orders/${shipForm.value.orderId}/ship/`, {
      tracking_no: shipForm.value.tracking_no
    });
    ElMessage.success('发货成功');
    showShipDialog.value = false;
    fetchOrders(currentTab.value === 'all' ? null : currentTab.value);
  } catch (error) {
    ElMessage.error('发货失败');
  }
};

const handleCancel = (orderId) => {
  ElMessageBox.confirm('确定要取消这个订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await api.post(`admin/orders/${orderId}/cancel/`);
      ElMessage.success('订单已取消');
      fetchOrders(currentTab.value === 'all' ? null : currentTab.value);
    } catch (error) {
      ElMessage.error('取消失败');
    }
  }).catch(() => {});
};

const showOrderDetail = async (order) => {
  try {
    const response = await api.get(`admin/orders/${order.id}/`);
    currentOrder.value = response.data;
    showDetailDialog.value = true;
  } catch (error) {
    ElMessage.error('获取订单详情失败');
  }
};
</script>

<style scoped>
.admin-order-page {
  min-height: 100vh;
  background-color: var(--color-bg-secondary);
  padding: var(--spacing-xl);
}

.admin-header {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
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

.tabs-container {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  padding: 0 var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.tabs {
  display: flex;
  gap: var(--spacing-xl);
}

.tab {
  padding: var(--spacing-md) 0;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-secondary);
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab:hover {
  color: var(--color-text-primary);
}

.tab.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.table-container {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.price-text {
  color: var(--color-price);
  font-weight: 600;
}

.order-detail {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.detail-section {
  padding: var(--spacing-md);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.detail-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
}

.detail-section p {
  margin: var(--spacing-xs) 0;
  line-height: 1.6;
}

.item-row {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--color-border);
}

.item-row:last-child {
  border-bottom: none;
}
</style>
