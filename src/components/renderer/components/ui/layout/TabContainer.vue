<script setup lang="ts">
defineProps<{
  active?: string | null
}>()
</script>

<template>
  <div class="jr-tab-container">
    <slot />
  </div>
</template>

<style scoped>
.jr-tab-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>

