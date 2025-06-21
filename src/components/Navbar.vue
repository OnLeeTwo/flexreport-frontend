<script setup lang="ts">
import { useAuth } from '@/auth/useAuth'

const auth = useAuth()

const logout = () => {
  auth.logout()
}
</script>

<template>
  <header class="bg-blue-700 text-white shadow">
    <div class="container mx-auto px-4 py-3 flex items-center justify-between">
      <h1 class="text-xl font-bold tracking-tight">FlexReport</h1>

      <nav class="space-x-4">
        <RouterLink to="/reports" class="hover:underline">Reports</RouterLink>
        <RouterLink to="/templates" class="hover:underline">Templates</RouterLink>
        <button @click="logout" class="ml-4 underline hover:no-underline">Logout</button>
      </nav>
    </div>
  </header>
</template>
