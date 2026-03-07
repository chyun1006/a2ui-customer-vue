<script setup lang="ts">
withDefaults(
  defineProps<{
    columns?: '2' | '3' | '4'
  }>(),
  { columns: '2' },
)
</script>

<template>
  <div :class="['jr-grid', `jr-grid--${columns}`]">
    <slot />
  </div>
</template>
