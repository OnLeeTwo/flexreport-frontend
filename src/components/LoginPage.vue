<script setup lang="ts">
import { shallowRef } from 'vue'
import { useAuth } from '../auth/useAuth'
import { Card, InputText, Password, Button, useToast } from 'primevue'

const toast = useToast()

const email = shallowRef<string>('')
const password = shallowRef<string>('')
const loading = shallowRef<boolean>(false)
const auth = useAuth()

const handleLogin = async () => {
  try {
    loading.value = true
    await auth.login({ email: email.value, password: password.value })
    toast.add({
      severity: 'success',
      summary: 'Login Successful',
      detail: 'Welcome back!',
      life: 3000,
    })
  } catch (err: unknown) {
    toast.add({
      severity: 'error',
      summary: 'Login Failed',
      detail: err instanceof Error ? err.message : 'Unknown error',
      life: 3000,
    })
    console.error('Login failed: ', err instanceof Error ? err.message : 'Unknown error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center"
    style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  >
    <Card class="w-full max-w-md mx-3">
      <template #content>
        <div class="text-center mb-5">
          <div class="text-900 text-3xl font-medium mb-3">Welcome Back</div>
          <span class="text-600 font-medium">Sign in to your account</span>
        </div>

        <form @submit.prevent="handleLogin">
          <div class="flex flex-column gap-2 mb-3">
            <label for="email" class="block text-900 text-xl font-medium mb-2">Email</label>
            <InputText
              id="email"
              v-model="email"
              type="email"
              placeholder="Enter your email"
              class="w-full p-3 text-lg"
              :class="{ 'p-invalid': false }"
              required
            />
          </div>

          <div class="flex flex-column gap-2 mb-5">
            <label for="password" class="block text-900 text-xl font-medium mb-2">Password</label>
            <Password
              id="password"
              v-model="password"
              placeholder="Enter your password"
              :toggleMask="true"
              class="w-full"
              inputClass="w-full p-3 text-lg"
              :feedback="false"
              required
            />
          </div>

          <Button type="submit" label="Sign In" class="w-full p-3 text-xl" :loading="loading" />
        </form>
      </template>
    </Card>
  </div>
</template>

<style scoped>
:deep(.p-card) {
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: none;
}

:deep(.p-card .p-card-content) {
  padding: 2rem;
}

:deep(.p-password-toggle-mask) {
  color: #6366f1;
}
</style>
