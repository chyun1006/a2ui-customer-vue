<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description?: string | null
  }>(),
  { description: null },
)
</script>

<template>
  <div class="jr-card">
    <h3 v-if="title" class="jr-card-title">{{ title }}</h3>
    <p v-if="description" class="jr-card-desc">{{ description }}</p>
    <slot />
  </div>
</template>
