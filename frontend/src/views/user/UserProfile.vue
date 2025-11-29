<template>
  <div class="profile-page">
    <div class="profile-container">
      <!-- Page Header -->
      <div class="page-header">
        <el-button text @click="$router.back()" class="back-button">
          <el-icon><ArrowLeft /></el-icon>
          {{ $t('profile.back') }}
        </el-button>
        <h1 class="page-title">{{ $t('profile.title') }}</h1>
      </div>

      <div class="content">
        <!-- User Info Card -->
        <div class="user-card card">
          <div class="user-info">
            <div class="avatar-wrapper">
              <img v-if="avatarUrl" :src="avatarUrl" class="avatar" />
              <el-icon v-else class="avatar-placeholder" :size="40"><User /></el-icon>
            </div>
            <div class="user-details">
              <h2 class="user-name">{{ userStore.user?.username || 'User' }}</h2>
              <p class="user-email">{{ userStore.user?.email }}</p>
            </div>
          </div>
        </div>

        <!-- Stats Row -->
        <div class="stats-row">
          <div class="stat-card card">
            <span class="stat-value">{{ orderCount }}</span>
            <span class="stat-label">{{ $t('profile.orders') }}</span>
          </div>
          <div class="stat-card card">
            <span class="stat-value">{{ favoriteCount }}</span>
            <span class="stat-label">{{ $t('profile.favorites') }}</span>
          </div>
          <div class="stat-card card">
            <span class="stat-value">{{ reviewCount }}</span>
            <span class="stat-label">{{ $t('profile.reviews') }}</span>
          </div>
        </div>

        <!-- Menu List -->
        <div class="menu-list">
          <div class="menu-item card" @click="$router.push('/user/profile/basic')">
            <div class="menu-left">
              <div class="menu-icon-wrapper">
                <el-icon :size="20"><User /></el-icon>
              </div>
              <span class="menu-label">{{ $t('profile.basicInfo') }}</span>
            </div>
            <el-icon class="menu-arrow"><ArrowRight /></el-icon>
          </div>

          <div class="menu-item card" @click="$router.push('/user/profile/address')">
            <div class="menu-left">
              <div class="menu-icon-wrapper">
                <el-icon :size="20"><Location /></el-icon>
              </div>
              <span class="menu-label">{{ $t('profile.address') }}</span>
            </div>
            <div class="menu-right">
              <span class="badge">{{ addressStore.addresses.length }}</span>
              <el-icon class="menu-arrow"><ArrowRight /></el-icon>
            </div>
          </div>

          <div class="menu-item card" @click="$router.push('/user/profile/security')">
            <div class="menu-left">
              <div class="menu-icon-wrapper">
                <el-icon :size="20"><Lock /></el-icon>
              </div>
              <span class="menu-label">{{ $t('profile.security') }}</span>
            </div>
            <el-icon class="menu-arrow"><ArrowRight /></el-icon>
          </div>
        </div>

        <!-- Support Section -->
        <div class="support-section card">
          <h3 class="section-title">{{ $t('profile.support') }}</h3>
          <div class="support-list">
            <div class="support-item">
              <span class="support-label">{{ $t('profile.helpCenter') }}</span>
            </div>
            <div class="support-item">
              <span class="support-label">{{ $t('profile.privacyPolicy') }}</span>
            </div>
            <div class="support-item">
              <span class="support-label">{{ $t('profile.termsOfService') }}</span>
            </div>
          </div>
        </div>

        <!-- Logout Button -->
        <button class="logout-btn" @click="handleLogout">
          <el-icon style="margin-right: 8px;"><SwitchButton /></el-icon>
          {{ $t('profile.logout') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '../../stores/user';
import { useAddressStore } from '../../stores/cart';
import { ElMessageBox } from 'element-plus';
import { ArrowLeft, ArrowRight, User, Location, Lock, SwitchButton } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const router = useRouter();
const userStore = useUserStore();
const addressStore = useAddressStore();

// Stats
const orderCount = ref(12);
const favoriteCount = ref(24);
const reviewCount = ref(5);

const avatarUrl = ref('');

onMounted(async () => {
  if (userStore.user) {
    avatarUrl.value = userStore.user.avatar;
  } else {
    await userStore.fetchUser();
    avatarUrl.value = userStore.user?.avatar;
  }
  await addressStore.fetchAddresses();
});

const handleLogout = () => {
  ElMessageBox.confirm(
    t('profile.confirmLogout'),
    t('profile.confirmTitle'),
    {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning',
    }
  ).then(() => {
    userStore.logout();
    router.push('/login');
  });
};
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background-color: #fafafa;
  padding-top: 80px;
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-xl);
}

.page-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.back-button {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-primary);
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Card Base Style */
.card {
  background-color: #ffffff;
  border-radius: 24px;
  padding: 24px;
  border: 1px solid #eee;
  transition: all 0.2s;
}

/* User Info Card */
.user-card {
  padding: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  color: #ccc;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.user-email {
  font-size: 14px;
  color: #999;
  margin: 0;
}

/* Stats Row */
.stats-row {
  display: flex;
  gap: 12px;
}

.stat-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

/* Menu List */
.menu-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  cursor: pointer;
}

.menu-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: var(--color-primary);
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.menu-icon-wrapper {
  width: 36px;
  height: 36px;
  background-color: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-label {
  font-weight: 600;
  font-size: 15px;
}

.menu-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.badge {
  background-color: #000;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-arrow {
  color: #ccc;
}

/* Support Section */
.support-section {
  padding: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 20px 0;
}

.support-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.support-label {
  font-weight: 500;
  font-size: 15px;
}

/* Logout Button */
.logout-btn {
  width: 100%;
  background-color: #ffffff;
  border: 1px solid #eee;
  border-radius: 30px;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #000;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.logout-btn:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: var(--color-primary);
}
</style>
