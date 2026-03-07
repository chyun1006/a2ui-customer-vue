<script setup lang="ts">
withDefaults(
  defineProps<{
    text: string
    level?: '1' | '2' | '3' | null
  }>(),
  { level: '2' },
)
</script>

<template>
  <component
    :is="level === '1' ? 'h1' : level === '2' ? 'h2' : 'h3'"
    class="jr-heading"
  >
    {{ text }}
  </component>
</template>
