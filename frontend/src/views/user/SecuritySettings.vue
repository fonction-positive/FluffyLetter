<template>
  <div class="security-page">
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <el-button text @click="$router.back()" class="back-button">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <h1 class="page-title">{{ $t('profile.security') }}</h1>
      </div>

      <!-- Change Password Section -->
      <div class="content-section card">
        <h2 class="section-title">{{ $t('profile.changePassword') }}</h2>
        <el-form 
          ref="passwordFormRef"
          :model="passwordForm" 
          :rules="passwordRules" 
          label-position="top" 
          class="password-form"
        >
          <el-form-item :label="$t('profile.oldPassword')" prop="old_password">
            <el-input v-model="passwordForm.old_password" type="password" show-password />
          </el-form-item>
          <el-form-item :label="$t('profile.newPassword')" prop="new_password">
            <el-input v-model="passwordForm.new_password" type="password" show-password />
          </el-form-item>
          <el-form-item :label="$t('profile.confirmPassword')" prop="confirm_password">
            <el-input v-model="passwordForm.confirm_password" type="password" show-password />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleChangePassword" :loading="passwordLoading">
              {{ $t('profile.changePassword') }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- Reset Password Section -->
      <div class="content-section card">
        <h2 class="section-title">{{ $t('profile.forgotPassword') }}</h2>
        <p class="section-description">{{ $t('profile.forgotPasswordDesc') }}</p>
        <el-form 
          ref="resetPasswordFormRef"
          :model="resetPasswordForm" 
          :rules="resetPasswordRules" 
          label-position="top" 
          class="password-form"
        >
          <el-form-item :label="$t('profile.emailCode')" prop="code">
            <div style="display: flex; gap: 10px;">
              <el-input 
                v-model="resetPasswordForm.code" 
                :placeholder="$t('profile.codePlaceholder')"
                maxlength="6"
              />
              <el-button 
                @click="handleSendResetCode" 
                :disabled="resetCountdown > 0"
                style="width: 140px;"
              >
                {{ resetCountdown > 0 ? $t('profile.retryAfter', { count: resetCountdown }) : $t('profile.sendCode') }}
              </el-button>
            </div>
            <div class="form-tip">{{ $t('profile.codeWillSendTo') }}{{ userStore.user?.email }}</div>
          </el-form-item>
          <el-form-item :label="$t('profile.newPassword')" prop="new_password">
            <el-input 
              v-model="resetPasswordForm.new_password" 
              type="password" 
              show-password 
              :placeholder="$t('profile.newPasswordPlaceholder')"
            />
          </el-form-item>
          <el-form-item :label="$t('profile.confirmPassword')" prop="confirm_new_password">
            <el-input 
              v-model="resetPasswordForm.confirm_new_password" 
              type="password" 
              show-password 
              :placeholder="$t('profile.confirmNewPasswordPlaceholder')"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleResetPassword" :loading="resetPasswordLoading">
              {{ $t('profile.resetPassword') }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useUserStore } from '../../stores/user';
import { ElMessage } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';
import api from '../../api/axios';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const userStore = useUserStore();

const passwordLoading = ref(false);
const resetPasswordLoading = ref(false);
const resetCountdown = ref(0);

// Password Form
const passwordFormRef = ref(null);
const passwordForm = reactive({
  old_password: '',
  new_password: '',
  confirm_password: ''
});

// Reset Password Form
const resetPasswordFormRef = ref(null);
const resetPasswordForm = reactive({
  code: '',
  new_password: '',
  confirm_new_password: ''
});

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.new_password) {
    callback(new Error(t('profile.passwordMismatch')));
  } else {
    callback();
  }
};

const validateConfirmResetPassword = (rule, value, callback) => {
  if (value !== resetPasswordForm.new_password) {
    callback(new Error(t('profile.passwordMismatch')));
  } else {
    callback();
  }
};

const passwordRules = computed(() => ({
  old_password: [{ required: true, message: t('profile.oldPasswordRequired'), trigger: 'blur' }],
  new_password: [
    { required: true, message: t('profile.newPasswordRequired'), trigger: 'blur' },
    { min: 6, message: t('profile.passwordMinLength'), trigger: 'blur' }
  ],
  confirm_password: [
    { required: true, message: t('profile.confirmPasswordRequired'), trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}));

const resetPasswordRules = computed(() => ({
  code: [
    { required: true, message: t('profile.codeRequired'), trigger: 'blur' },
    { len: 6, message: t('profile.codeLength'), trigger: 'blur' }
  ],
  new_password: [
    { required: true, message: t('profile.newPasswordRequired'), trigger: 'blur' },
    { min: 6, message: t('profile.passwordMinLength'), trigger: 'blur' }
  ],
  confirm_new_password: [
    { required: true, message: t('profile.confirmPasswordRequired'), trigger: 'blur' },
    { validator: validateConfirmResetPassword, trigger: 'blur' }
  ]
}));

const handleChangePassword = async () => {
  if (!passwordFormRef.value) return;
  
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      passwordLoading.value = true;
      try {
        await userStore.changePassword({
          old_password: passwordForm.old_password,
          new_password: passwordForm.new_password
        });
        ElMessage.success(t('profile.passwordChanged'));
        passwordForm.old_password = '';
        passwordForm.new_password = '';
        passwordForm.confirm_password = '';
      } catch (error) {
        ElMessage.error(error.response?.data?.old_password?.[0] || t('profile.passwordChangeFailed'));
      } finally {
        passwordLoading.value = false;
      }
    }
  });
};

const startResetCountdown = () => {
  resetCountdown.value = 60;
  const timer = setInterval(() => {
    resetCountdown.value--;
    if (resetCountdown.value <= 0) {
      clearInterval(timer);
    }
  }, 1000);
};

const handleSendResetCode = async () => {
  try {
    await api.post('auth/send_reset_code/');
    ElMessage.success(t('profile.codeSent'));
    startResetCountdown();
  } catch (error) {
    const detail = error.response?.data?.detail;
    if (detail) {
      ElMessage.error(detail);
    } else {
      ElMessage.error(t('profile.codeSendFailed'));
    }
  }
};

const handleResetPassword = async () => {
  if (!resetPasswordFormRef.value) return;
  
  await resetPasswordFormRef.value.validate(async (valid) => {
    if (valid) {
      resetPasswordLoading.value = true;
      try {
        await api.post('auth/reset_password/', {
          code: resetPasswordForm.code,
          new_password: resetPasswordForm.new_password
        });
        ElMessage.success(t('profile.resetSuccess'));
        resetPasswordForm.code = '';
        resetPasswordForm.new_password = '';
        resetPasswordForm.confirm_new_password = '';
        resetPasswordFormRef.value.resetFields();
      } catch (error) {
        const detail = error.response?.data?.detail;
        if (detail) {
          ElMessage.error(detail);
        } else {
          ElMessage.error(t('profile.resetFailed'));
        }
      } finally {
        resetPasswordLoading.value = false;
      }
    }
  });
};
</script>

<style scoped>
.security-page {
  min-height: 100vh;
  background-color: #fafafa;
  padding-top: 80px;
}

.page-container {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-xl);
}

.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: var(--spacing-xl);
}

.back-button {
  font-size: 24px;
  font-weight: 400;
  color: #000;
  padding: 0;
  min-width: auto;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #000000;
  margin: 0;
}

.content-section {
  background-color: #ffffff;
  border-radius: 24px;
  padding: 32px;
  border: 1px solid #eee;
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 20px 0;
}

.section-description {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 20px;
}

.password-form {
  max-width: 500px;
}

.form-tip {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}
</style>
