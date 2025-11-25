<template>
  <div class="login-page">
    <div class="login-card">
      <!-- Logo -->
      <div class="logo-container">
        <div class="logo">S</div>
      </div>

      <!-- Title -->
      <h1 class="title">欢迎回来</h1>
      <p class="subtitle">登录您的账户以继续</p>

      <!-- Login Form -->
      <el-form 
        ref="formRef"
        :model="form" 
        :rules="rules"
        label-position="top"
        class="login-form"
        :hide-required-asterisk="true"
      >
<!--        <el-form-item label="用户名" prop="username">-->
        <el-form-item prop="username">
          <el-input 
            v-model="form.username" 
            placeholder="请输入用户名"
            size="large"
            clearable
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>

<!--        <el-form-item label="密码" prop="password">-->
        <el-form-item prop="password">
          <el-input 
            v-model="form.password" 
            :type="showPassword ? 'text' : 'password'"
            placeholder="请输入密码"
            size="large"
            clearable
            @keyup.enter="handleLogin"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
            <template #suffix>
              <el-icon 
                class="password-toggle" 
                @click="showPassword = !showPassword"
              >
                <View v-if="!showPassword" />
                <Hide v-else />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <div class="button-group">
          <el-alert v-if="errorMessage" type="error" :title="errorMessage" show-icon class="login-error-alert" :closable="false" :duration="0" />
          <el-button 
            type="primary" 
            size="large" 
            @click="handleLogin" 
            :loading="loading"
            :disabled="loading"
            class="login-button"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>

          <el-button 
            size="large" 
            @click="$router.push('/register')"
            class="register-button"
          >
            注册新账户
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '../../stores/user';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Lock, View, Hide } from '@element-plus/icons-vue';

const userStore = useUserStore();
const router = useRouter();

const formRef = ref(null);
const form = ref({
  username: '',
  password: ''
});
const loading = ref(false);
const showPassword = ref(false);
const errorMessage = ref('');

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应为3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ]
};

const handleLogin = async () => {
  // 验证表单
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
  } catch (error) {
    ElMessage.warning('请正确填写表单信息');
    return;
  }

  loading.value = true;
  // 清除之前的错误信息
  errorMessage.value = '';
  try {
    await userStore.login(form.value.username, form.value.password);
    ElMessage.success('登录成功！欢迎回来');
    errorMessage.value = '';
    router.push('/');
  } catch (error) {
    // 调试:打印完整的错误对象
    console.log('完整错误对象:', error);
    console.log('错误响应:', error.response);
    console.log('响应数据:', error.response?.data);
    console.log('detail字段:', error.response?.data?.detail);
    
    let errorMsg = '登录失败，请检查用户名和密码';
    
    // 处理不同的错误情况
    if (error.response?.data?.detail) {
      const detail = error.response.data.detail;
      // 如果detail是数组,取第一个元素
      errorMsg = Array.isArray(detail) ? detail[0] : detail;
    } else if (error.response?.data?.message) {
      const message = error.response.data.message;
      errorMsg = Array.isArray(message) ? message[0] : message;
    }
    
    console.log('最终错误消息:', errorMsg);
    
    // 清除输入框内容
    form.value.username = '';
    form.value.password = '';
    errorMessage.value = errorMsg;
    // Persistent alert handled by el-alert component; no transient message needed
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f7;
  padding: var(--spacing-xl);
}

.login-card {
  background: white;
  border-radius: 24px;
  padding: 48px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}

.logo {
  width: 72px;
  height: 72px;
  background: #1d1d1f;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  color: white;
  letter-spacing: -0.02em;
}

.title {
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  color: #1d1d1f;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: 15px;
  text-align: center;
  color: #86868b;
  margin-bottom: 32px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 16px;
  animation: fade-in 0.6s ease both;
}

.login-form :deep(.el-form-item:nth-child(1)) {
  animation-delay: 0.5s;
}

.login-form :deep(.el-form-item__label) {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 8px;
  padding: 0;
  line-height: 1.5;
}

.login-form :deep(.el-form-item__error) {
  font-size: 13px;
  margin-top: 6px;
  color: #ff3b30;
}

.login-form :deep(.el-input__wrapper) {
  background-color: #f5f5f7;
  border: none;
  box-shadow: none;
  border-radius: 12px;
  padding: 12px 16px;
  transition: all 0.2s ease;
}

.login-form :deep(.el-input__wrapper:hover) {
  background-color: #ebebed;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  background-color: #ebebed;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.login-form :deep(.el-input__inner) {
  font-size: 15px;
}

.login-form :deep(.el-input__prefix),
.login-form :deep(.el-input__suffix) {
  color: #86868b;
}

.password-toggle {
  cursor: pointer;
  transition: color 0.2s ease;
}

.password-toggle:hover {
  color: #1d1d1f;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
  animation: fade-in 0.6s ease 0.7s both;
  align-items: stretch;
}

.button-group .el-button + .el-button {
  margin-left: 0;
}

.login-error-alert {
  margin-bottom: 12px;
}

.login-button {
  width: 100%;
  height: 52px;
  background: #1d1d1f;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.01em;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 16px rgba(29, 29, 31, 0.3);
  position: relative;
  overflow: hidden;
}

.login-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.login-button:hover::before {
  left: 100%;
}

.login-button:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 24px rgba(29, 29, 31, 0.4);
}

.login-button:active {
  transform: translateY(0) scale(0.98);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.register-button {
  width: 100%;
  height: 52px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #d2d2d7;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  color: #1d1d1f;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.register-button :deep(span) {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.register-button:hover {
  background: rgba(255, 255, 255, 0.8) !important;
  border-color: #d2d2d7 !important;
  color: #1d1d1f !important;
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.register-button:active {
  transform: scale(0.98);
}

@media (max-width: 768px) {
  .login-card {
    padding: 32px 24px;
  }

  .title {
    font-size: 24px;
  }
}
</style>
