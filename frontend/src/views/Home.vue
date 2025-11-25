<template>
  <div class="home">
    <h1>Welcome to StoreWeb</h1>
    <p v-if="userStore.isAuthenticated">Hello, {{ userStore.user?.username }}</p>
    <el-button v-if="!userStore.isAuthenticated" @click="$router.push('/login')">Login</el-button>
    <el-button v-else @click="handleLogout">Logout</el-button>
  </div>
</template>

<script setup>
import { useUserStore } from '../stores/user';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

const handleLogout = () => {
  userStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.home {
  text-align: center;
  margin-top: 50px;
}
</style>
