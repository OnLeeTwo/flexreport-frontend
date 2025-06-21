<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ConfirmDialog } from 'primevue'
import Toast from 'primevue/toast'
</script>

<template>
  <ConfirmDialog />
  <RouterView />
  <Toast position="bottom-right" />
</template>
