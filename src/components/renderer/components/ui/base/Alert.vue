<script setup lang="ts">
defineProps<{
  message: string
  type: 'success' | 'warning' | 'error' | 'info'
}>()
</script>

<template>
  <div :class="['jr-alert', `jr-alert--${type}`]">{{ message }}</div>
</template>
