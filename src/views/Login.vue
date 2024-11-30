<template>
  <div class="login-container">
    <vx-card class="login-card">
      <h2 class="text-center mb-4">Medical Billing System</h2>
      
      <form @submit.prevent="handleLogin">
        <vx-input
          v-model="email"
          type="email"
          label="Email"
          required
          class="mb-3"
        />

        <vx-input
          v-model="password"
          type="password"
          label="Password"
          required
          class="mb-4"
        />

        <div class="flex gap-3 mb-4">
          <vx-button
            type="submit"
            variant="primary"
            block
            :loading="loading"
          >
            Login
          </vx-button>
          
          <vx-button
            type="button"
            variant="secondary"
            block
            @click="handleRegister"
          >
            Register
          </vx-button>
        </div>

        <vx-alert
          v-if="error"
          variant="danger"
          class="mt-3"
        >
          {{ error }}
        </vx-alert>
      </form>
    </vx-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

function handleRegister() {
  router.push('/register');
}

async function handleLogin() {
  try {
    loading.value = true;
    error.value = '';

    const { error: loginError } = await authStore.login(email.value, password.value);

    if (loginError) {
      throw loginError;
    }

    if (authStore.isAdmin) {
      router.push('/analytics');
    } else {
      router.push('/my-orders');
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to sign in';
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.login-card {
  width: 100%;
  max-width: 400px;
}
</style>
