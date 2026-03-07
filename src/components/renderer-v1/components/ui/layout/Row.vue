<script setup lang="ts">
withDefaults(
  defineProps<{
    gap?: 'sm' | 'md' | 'lg' | null
  }>(),
  { gap: 'md' },
)
</script>

<template>
  <div :class="['jr-row', `jr-row--gap-${gap ?? 'md'}`]">
    <slot />
  </div>
</template>
