<script setup lang="ts">
defineProps<{
  label: string
  variant: 'success' | 'warning' | 'error' | 'info'
}>()
</script>

<template>
  <span :class="['jr-badge', `jr-badge--${variant}`]">{{ label }}</span>
</template>
