<template>
  <div class="basic-info-page">
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <el-button text @click="$router.back()" class="back-button">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <h1 class="page-title">{{ $t('profile.basicInfo') }}</h1>
      </div>

      <!-- Content -->
      <div class="content card">
        <el-form :model="profileForm" label-position="top" class="profile-form">
          <el-form-item :label="$t('profile.avatar')">
            <div class="avatar-uploader">
              <el-upload
                class="avatar-upload"
                action="#"
                :show-file-list="false"
                :auto-upload="false"
                :on-change="handleAvatarChange"
              >
                <img v-if="avatarUrl" :src="avatarUrl" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
              <div class="avatar-tip">{{ $t('profile.avatarTip') }}</div>
            </div>
          </el-form-item>

          <el-form-item :label="$t('profile.username')">
            <el-input v-model="profileForm.username" />
          </el-form-item>

          <el-form-item :label="$t('profile.email')">
            <el-input v-model="profileForm.email" disabled />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleUpdateProfile" :loading="loading">
              {{ $t('profile.saveChanges') }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useUserStore } from '../../stores/user';
import { ElMessage } from 'element-plus';
import { Plus, ArrowLeft } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const userStore = useUserStore();
const loading = ref(false);

const profileForm = reactive({
  username: '',
  email: ''
});
const avatarUrl = ref('');
const avatarFile = ref(null);

onMounted(async () => {
  if (userStore.user) {
    initProfileForm();
  } else {
    await userStore.fetchUser();
    initProfileForm();
  }
});

const initProfileForm = () => {
  if (userStore.user) {
    profileForm.username = userStore.user.username;
    profileForm.email = userStore.user.email;
    avatarUrl.value = userStore.user.avatar;
  }
};

const handleAvatarChange = (file) => {
  avatarFile.value = file.raw;
  avatarUrl.value = URL.createObjectURL(file.raw);
};

const handleUpdateProfile = async () => {
  loading.value = true;
  try {
    const formData = new FormData();
    formData.append('username', profileForm.username);
    formData.append('email', profileForm.email);
    if (avatarFile.value) {
      formData.append('avatar', avatarFile.value);
    }
    
    await userStore.updateProfile(formData);
    ElMessage.success(t('profile.profileUpdated'));
  } catch (error) {
    if (error.response?.data?.username) {
      ElMessage.error(error.response.data.username[0] || t('profile.usernameExists'));
    } else {
      ElMessage.error(error.response?.data?.message || t('profile.updateFailed'));
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.basic-info-page {
  min-height: 100vh;
  background-color: #fafafa;
  padding-top: 80px;
}

.page-container {
  max-width: 1200px;
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

.card {
  background-color: #ffffff;
  border-radius: 24px;
  padding: 32px;
  border: 1px solid #eee;
}

.profile-form {
  max-width: 500px;
}

/* Avatar Upload */
.avatar-uploader {
  text-align: center;
}

.avatar-upload {
  border: 1px dashed var(--color-border);
  border-radius: 50%;
  cursor: pointer;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: border-color 0.3s;
  margin: 0 auto;
}

.avatar-upload:hover {
  border-color: var(--color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.avatar {
  width: 120px;
  height: 120px;
  object-fit: cover;
}

.avatar-tip {
  margin-top: 8px;
  font-size: 12px;
  color: var(--color-text-secondary);
}
</style>
