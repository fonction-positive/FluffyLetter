<template>
  <div class="address-page">
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <el-button text @click="$router.back()" class="back-button">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <h1 class="page-title">{{ $t('profile.addressManage') }}</h1>
        <div class="header-actions">
          <el-button type="primary" @click="openAddressDialog()">
            {{ $t('profile.addAddress') }}
          </el-button>
        </div>
      </div>

      <!-- Address List -->
      <div v-if="addressStore.addresses.length > 0" class="address-grid">
        <div 
          v-for="addr in addressStore.addresses" 
          :key="addr.id"
          class="address-card card"
        >
          <div class="address-header">
            <span class="recipient">{{ addr.recipient_name }}</span>
            <span class="phone">{{ addr.phone }}</span>
            <el-tag v-if="addr.is_default" type="success" size="small">
              {{ $t('profile.default') }}
            </el-tag>
          </div>
          <p class="address-detail">
            {{ addr.province }} {{ addr.city }} {{ addr.district }}<br>
            {{ addr.address }}
          </p>
          <div class="address-actions">
            <el-button link type="primary" @click="openAddressDialog(addr)">
              {{ $t('profile.edit') }}
            </el-button>
            <el-button link type="danger" @click="handleDeleteAddress(addr.id)">
              {{ $t('profile.delete') }}
            </el-button>
            <el-button 
              v-if="!addr.is_default" 
              link 
              type="success" 
              @click="handleSetDefault(addr)"
            >
              {{ $t('profile.setAsDefault') }}
            </el-button>
          </div>
        </div>
      </div>
      <el-empty v-else :description="$t('profile.noAddress')" />
    </div>

    <!-- Address Edit Dialog -->
    <el-dialog 
      v-model="showAddressDialog" 
      :title="editingAddress ? $t('profile.editAddress') : $t('profile.addAddress')" 
      width="500px"
    >
      <el-form :model="addressForm" label-position="top">
        <el-form-item :label="$t('profile.recipient')">
          <el-input v-model="addressForm.recipient_name" />
        </el-form-item>
        <el-form-item :label="$t('profile.phone')">
          <el-input v-model="addressForm.phone" />
        </el-form-item>
        <el-form-item :label="$t('profile.province')">
          <el-input v-model="addressForm.province" />
        </el-form-item>
        <el-form-item :label="$t('profile.city')">
          <el-input v-model="addressForm.city" />
        </el-form-item>
        <el-form-item :label="$t('profile.district')">
          <el-input v-model="addressForm.district" />
        </el-form-item>
        <el-form-item :label="$t('profile.detailAddress')">
          <el-input v-model="addressForm.address" type="textarea" />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="addressForm.is_default">
            {{ $t('profile.setDefault') }}
          </el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddressDialog = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSaveAddress" :loading="loading">
          {{ $t('common.save') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useAddressStore } from '../../stores/cart';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const addressStore = useAddressStore();
const loading = ref(false);

const showAddressDialog = ref(false);
const editingAddress = ref(null);
const addressForm = reactive({
  recipient_name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  address: '',
  is_default: false
});

onMounted(async () => {
  await addressStore.fetchAddresses();
});

const openAddressDialog = (address = null) => {
  editingAddress.value = address;
  if (address) {
    Object.assign(addressForm, {
      recipient_name: address.recipient_name,
      phone: address.phone,
      province: address.province,
      city: address.city,
      district: address.district,
      address: address.address,
      is_default: address.is_default
    });
  } else {
    Object.assign(addressForm, {
      recipient_name: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      address: '',
      is_default: false
    });
  }
  showAddressDialog.value = true;
};

const handleSaveAddress = async () => {
  loading.value = true;
  try {
    if (editingAddress.value) {
      await addressStore.updateAddress(editingAddress.value.id, addressForm);
      ElMessage.success(t('profile.addressUpdated'));
    } else {
      await addressStore.createAddress(addressForm);
      ElMessage.success(t('profile.addressAdded'));
    }
    await addressStore.fetchAddresses();
    showAddressDialog.value = false;
  } catch (error) {
    ElMessage.error(t('profile.saveFailed'));
  } finally {
    loading.value = false;
  }
};

const handleDeleteAddress = (id) => {
  ElMessageBox.confirm(t('profile.confirmDelete'), t('profile.confirmTitle'), {
    type: 'warning'
  }).then(async () => {
    try {
      await addressStore.deleteAddress(id);
      await addressStore.fetchAddresses();
      ElMessage.success(t('profile.deleteSuccess'));
    } catch (error) {
      ElMessage.error(t('profile.deleteFailed'));
    }
  });
};

const handleSetDefault = async (address) => {
  try {
    await addressStore.updateAddress(address.id, { ...address, is_default: true });
    await addressStore.fetchAddresses();
    ElMessage.success(t('profile.setSuccess'));
  } catch (error) {
    ElMessage.error(t('profile.setFailed'));
  }
};
</script>

<style scoped>
.address-page {
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
  flex: 1;
}

.header-actions {
  margin-left: auto;
}

.card {
  background-color: #ffffff;
  border-radius: 24px;
  padding: 24px;
  border: 1px solid #eee;
  transition: all 0.2s;
}

/* Address Grid */
.address-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.address-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: var(--color-primary);
}

.address-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.recipient {
  font-weight: 600;
  font-size: 16px;
}

.phone {
  color: var(--color-text-secondary);
  font-size: 14px;
}

.address-detail {
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
  min-height: 42px;
}

.address-actions {
  display: flex;
  gap: 12px;
  border-top: 1px solid #f5f5f5;
  padding-top: 12px;
}
</style>
