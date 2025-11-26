<template>
  <div class="verify-page">
    <div class="verify-card">
      <!-- Logo -->
      <div class="logo-container">
        <div class="logo">F</div>
      </div>

      <!-- Title -->
      <h1 class="title">验证您的邮箱</h1>
      <p class="subtitle">我们已向 <strong>{{ email }}</strong> 发送了验证码</p>

      <!-- Code Input -->
      <div class="code-container">
        <input
          v-for="(digit, index) in codeDigits"
          :key="index"
          :ref="el => inputRefs[index] = el"
          v-model="codeDigits[index]"
          type="text"
          inputmode="numeric"
          maxlength="1"
          class="code-input"
          @input="handleInput(index, $event)"
          @keydown="handleKeydown(index, $event)"
          @paste="handlePaste"
        />
      </div>

      <!-- Error Message -->
      <el-alert 
        v-if="errorMessage" 
        type="error" 
        :title="errorMessage" 
        show-icon 
        class="error-alert" 
        :closable="false"
      />

      <!-- Verify Button -->
      <el-button 
        type="primary" 
        size="large" 
        @click="handleVerify" 
        :loading="loading"
        :disabled="loading || codeDigits.join('').length !== 6"
        class="verify-button"
      >
        {{ loading ? '验证中...' : '验证' }}
      </el-button>

      <!-- Resend -->
      <div class="resend-container">
        <span v-if="countdown > 0" class="resend-text">
          {{ countdown }} 秒后可重新发送
        </span>
        <a v-else @click="resendCode" class="resend-link">
          重新发送验证码
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import axios from '../../api/axios';
import { useUserStore } from '../../stores/user';

const router = useRouter();
const route = useRoute();

const email = ref(route.query.email || '');
const codeDigits = ref(['', '', '', '', '', '']);
const inputRefs = ref([]);
const loading = ref(false);
const errorMessage = ref('');
const countdown = ref(60);
let countdownTimer = null;

// 开始倒计时
const startCountdown = () => {
  countdown.value = 60;
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
  countdownTimer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }, 1000);
};

// 处理输入
const handleInput = (index, event) => {
  const value = event.target.value;
  
  // 只允许数字
  if (value && !/^\d$/.test(value)) {
    codeDigits.value[index] = '';
    return;
  }
  
  // 自动跳转到下一个输入框
  if (value && index < 5) {
    inputRefs.value[index + 1]?.focus();
  }
  
  // 清除错误信息
  errorMessage.value = '';
};

// 处理键盘事件
const handleKeydown = (index, event) => {
  if (event.key === 'Backspace' && !codeDigits.value[index] && index > 0) {
    inputRefs.value[index - 1]?.focus();
  }
};

// 处理粘贴
const handlePaste = (event) => {
  event.preventDefault();
  const pastedData = event.clipboardData.getData('text').trim();
  
  if (/^\d{6}$/.test(pastedData)) {
    codeDigits.value = pastedData.split('');
    inputRefs.value[5]?.focus();
  }
};

// 验证
const handleVerify = async () => {
  const code = codeDigits.value.join('');
  
  if (code.length !== 6) {
    errorMessage.value = '请输入6位验证码';
    return;
  }
  
  loading.value = true;
  errorMessage.value = '';
  
  try {
    const response = await axios.post('auth/verify_register/', {
      email: email.value,
      code: code
    });
    
    // 保存token和用户信息
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    
    // 更新用户store
    const userStore = useUserStore();
    userStore.accessToken = response.data.access;
    userStore.refreshToken = response.data.refresh;
    userStore.user = response.data.user;
    
    // 清除注册数据
    localStorage.removeItem('registerData');
    
    ElMessage.success('注册成功！欢迎加入');
    
    // 跳转到首页
    router.push('/');
  } catch (error) {
    let errorMsg = '验证失败';
    if (error.response?.data?.detail) {
      errorMsg = error.response.data.detail;
    }
    
    errorMessage.value = errorMsg;
    // 清空验证码
    codeDigits.value = ['', '', '', '', '', ''];
    inputRefs.value[0]?.focus();
  } finally {
    loading.value = false;
  }
};

// 重新发送验证码
const resendCode = async () => {
  try {
    // 重新调用注册接口
    const registerData = JSON.parse(localStorage.getItem('registerData') || '{}');
    
    if (!registerData.username || !registerData.email || !registerData.password) {
      ElMessage.error('注册信息已过期，请重新注册');
      router.push('/register');
      return;
    }
    
    await axios.post('auth/register/', registerData);
    ElMessage.success('验证码已重新发送');
    startCountdown();
  } catch (error) {
    let errorMsg = '发送失败';
    if (error.response?.data?.detail) {
      errorMsg = error.response.data.detail;
    }
    ElMessage.error(errorMsg);
  }
};

onMounted(() => {
  if (!email.value) {
    ElMessage.error('缺少邮箱信息');
    router.push('/register');
    return;
  }
  
  // 自动聚焦第一个输入框
  inputRefs.value[0]?.focus();
  
  // 开始倒计时
  startCountdown();
});

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
});
</script>

<style scoped>
.verify-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f7;
  padding: var(--spacing-xl);
}

.verify-card {
  background: white;
  border-radius: 24px;
  padding: 48px;
  width: 100%;
  max-width: 480px;
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
  margin-bottom: 40px;
}

.subtitle strong {
  color: #1d1d1f;
  font-weight: 600;
}

.code-container {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 24px;
}

.code-input {
  width: 52px;
  height: 64px;
  text-align: center;
  font-size: 28px;
  font-weight: 600;
  border: 2px solid #d2d2d7;
  border-radius: 12px;
  background: #f5f5f7;
  color: #1d1d1f;
  transition: all 0.2s ease;
  outline: none;
}

.code-input:focus {
  border-color: #1d1d1f;
  background: white;
  box-shadow: 0 0 0 3px rgba(29, 29, 31, 0.1);
}

.code-input:not(:placeholder-shown) {
  background: white;
  border-color: #1d1d1f;
}

.error-alert {
  margin-bottom: 20px;
}

.verify-button {
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
  margin-bottom: 20px;
}

.verify-button:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 24px rgba(29, 29, 31, 0.4);
}

.verify-button:active {
  transform: translateY(0) scale(0.98);
}

.verify-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.resend-container {
  text-align: center;
}

.resend-text {
  color: #86868b;
  font-size: 14px;
}

.resend-link {
  color: #1d1d1f;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.resend-link:hover {
  transform: scale(1.05);
  text-decoration: underline;
}

@media (max-width: 768px) {
  .verify-card {
    padding: 32px 24px;
  }

  .title {
    font-size: 24px;
  }

  .code-input {
    width: 44px;
    height: 56px;
    font-size: 24px;
  }
}
</style>
