<template>
  <div class="register-page">
    <div class="register-card">
      <!-- Logo -->
      <div class="logo-container">
        <div class="logo">S</div>
      </div>

      <!-- Title -->
      <h1 class="title">创建账户</h1>

      <!-- Register Form -->
      <el-form 
        ref="formRef"
        :model="form" 
        :rules="rules"
        label-position="top"
        class="register-form"
        :hide-required-asterisk="true"
      >
<!--        <el-form-item label="用户名" prop="username">-->
        <el-form-item prop="username">
          <el-input 
            v-model="form.username" 
            placeholder="请输入用户名（3-20个字符）"
            size="large"
            clearable
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>

<!--        <el-form-item label="邮箱" prop="email">-->
        <el-form-item prop="email">
          <el-input 
            v-model="form.email" 
            type="email"
            placeholder="请输入邮箱地址"
            size="large"
            clearable
          >
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
        </el-form-item>

<!--        <el-form-item label="密码" prop="password">-->
        <el-form-item prop="password">
          <el-input 
            v-model="form.password" 
            :type="showPassword ? 'text' : 'password'"
            placeholder="请输入密码（至少6位）"
            size="large"
            clearable
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

<!--        <el-form-item label="确认密码" prop="confirmPassword">-->
        <el-form-item prop="confirmPassword">
          <el-input 
            v-model="form.confirmPassword" 
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="请再次输入密码"
            size="large"
            clearable
            @keyup.enter="handleRegister"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
            <template #suffix>
              <el-icon 
                class="password-toggle" 
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <View v-if="!showConfirmPassword" />
                <Hide v-else />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <div class="button-group">
          <el-button 
            type="primary" 
            size="large" 
            @click="handleRegister" 
            :loading="loading"
            :disabled="loading"
            class="register-button"
          >
            {{ loading ? '注册中...' : '注册' }}
          </el-button>

          <el-button 
            size="large" 
            @click="$router.push('/login')"
            class="login-button"
          >
            已有账户？去登录
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
import { User, Lock, Message, View, Hide } from '@element-plus/icons-vue';

const userStore = useUserStore();
const router = useRouter();

const formRef = ref(null);
const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
});
const loading = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// 邮箱验证规则
const validateEmail = (rule, value, callback) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!value) {
    callback(new Error('请输入邮箱地址'));
  } else if (!emailRegex.test(value)) {
    callback(new Error('请输入有效的邮箱地址'));
  } else {
    callback();
  }
};

// 确认密码验证规则
const validateConfirmPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请再次输入密码'));
  } else if (value !== form.value.password) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应为3-20个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  email: [
    { required: true, validator: validateEmail, trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
};

const handleRegister = async () => {
  // 验证表单
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
  } catch (error) {
    ElMessage.warning('请正确填写表单信息');
    return;
  }

  loading.value = true;
  try {
    const { confirmPassword, ...registerData } = form.value;
    
    // 发送验证码
    await userStore.register(registerData);
    
    // 保存注册数据到本地存储（用于重新发送验证码）
    localStorage.setItem('registerData', JSON.stringify(registerData));
    
    ElMessage.success('验证码已发送到您的邮箱');
    
    // 跳转到验证页面
    router.push({
      path: '/verify-email',
      query: { email: registerData.email }
    });
  } catch (error) {
    const errorMsg = error.response?.data?.detail || error.response?.data?.message || '注册失败，请重试';
    ElMessage.error(errorMsg);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f7;
  padding: var(--spacing-xl);
}

.register-card {
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

.register-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.register-form :deep(.el-form-item) {
  margin-bottom: 16px;
}



.register-form :deep(.el-form-item__label) {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 8px;
  padding: 0;
  line-height: 1.5;
}

.register-form :deep(.el-form-item__error) {
  font-size: 13px;
  margin-top: 6px;
  color: #ff3b30;
}

.register-form :deep(.el-input__wrapper) {
  background-color: #f5f5f7;
  border: none;
  box-shadow: none;
  border-radius: 12px;
  padding: 12px 16px;
  transition: all 0.2s ease;
}

.register-form :deep(.el-input__wrapper:hover) {
  background-color: #ebebed;
}

.register-form :deep(.el-input__wrapper.is-focus) {
  background-color: #ebebed;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.register-form :deep(.el-input__inner) {
  font-size: 15px;
}

.register-form :deep(.el-input__prefix),
.register-form :deep(.el-input__suffix) {
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
  align-items: stretch;
}

.button-group .el-button + .el-button {
  margin-left: 0;
}

.register-button {
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

.register-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.register-button:hover::before {
  left: 100%;
}

.register-button:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 24px rgba(29, 29, 31, 0.4);
}

.register-button:active {
  transform: translateY(0) scale(0.98);
}

.register-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-button {
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

.login-button:hover {
  background: rgba(255, 255, 255, 0.8) !important;
  border-color: #d2d2d7 !important;
  color: #1d1d1f !important;
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.login-button:active {
  transform: scale(0.98);
}

@media (max-width: 768px) {
  .register-card {
    padding: 32px 24px;
  }

  .title {
    font-size: 24px;
  }
}
</style>
```
