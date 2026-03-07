<script setup lang="ts">
withDefaults(
  defineProps<{
    ordered?: boolean | null
    gap?: 'sm' | 'md' | 'lg' | null
  }>(),
  { ordered: false, gap: 'md' }
)
</script>

<template>
  <component
    :is="ordered ? 'ol' : 'ul'"
    :class="['jr-list', `jr-list--gap-${gap ?? 'md'}`]"
  >
    <slot />
  </component>
</template>

<style scoped>
.jr-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--jr-border, #e4e4e7);
  border-radius: var(--jr-radius-lg, 0.75rem);
  overflow: hidden;
}
.jr-list--gap-sm {
  gap: 0;
}
.jr-list--gap-md {
  gap: 0;
}
.jr-list--gap-lg {
  gap: 0;
}
ol.jr-list {
  list-style: decimal;
  padding-left: 1.5rem;
}
</style>
