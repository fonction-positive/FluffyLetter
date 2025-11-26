<template>
  <div class="admin-users-page">
    <!-- Header -->
    <header class="admin-header">
      <div class="title-row">
        <el-button text @click="$router.back()" class="back-button">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h1 class="page-title">用户管理</h1>
      </div>
    </header>

    <!-- Users Table -->
    <div class="table-container">
      <el-table :data="users" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.role === 'admin' ? 'danger' : 'primary'" size="small">
              {{ scope.row.role === 'admin' ? '管理员' : '用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.is_active ? 'success' : 'danger'" size="small">
              {{ scope.row.is_active ? '正常' : '已封禁' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="date_joined" label="注册时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.date_joined) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button 
              v-if="!scope.row.is_superuser"
              size="small" 
              :type="scope.row.is_active ? 'danger' : 'success'"
              @click="handleToggleBan(scope.row)"
            >
              {{ scope.row.is_active ? '封禁' : '解封' }}
            </el-button>
            <span v-else class="superuser-label">超级管理员</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api/axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';

const users = ref([]);
const loading = ref(false);

onMounted(() => {
  fetchUsers();
});

const fetchUsers = async () => {
  loading.value = true;
  try {
    const response = await api.get('admin/users/');
    users.value = response.data;
  } catch (error) {
    ElMessage.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN');
};

const handleToggleBan = (user) => {
  const action = user.is_active ? '封禁' : '解封';
  ElMessageBox.confirm(
    `确定要${action}用户"${user.username}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const endpoint = user.is_active ? 'ban' : 'unban';
      await api.post(`admin/users/${user.id}/${endpoint}/`);
      ElMessage.success(`${action}成功`);
      fetchUsers();
    } catch (error) {
      ElMessage.error(`${action}失败`);
    }
  }).catch(() => {});
};
</script>

<style scoped>
.admin-users-page {
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

.table-container {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.superuser-label {
  font-size: 13px;
  color: var(--color-text-secondary);
}
</style>
