<script setup lang="ts">
withDefaults(
  defineProps<{
    gap?: 'sm' | 'md' | 'lg' | null
  }>(),
  { gap: 'md' },
)
</script>

<template>
  <div :class="['jr-column', `jr-column--gap-${gap ?? 'md'}`]">
    <slot />
  </div>
</template>
