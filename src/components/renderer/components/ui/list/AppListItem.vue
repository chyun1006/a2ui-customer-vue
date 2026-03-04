<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description?: string | null
    icon?: string | null
    trailing?: string | null
  }>(),
  { description: null, icon: null, trailing: null }
)
</script>

<template>
  <li class="jr-list-item">
    <span v-if="icon" class="jr-list-item-icon">{{ icon }}</span>
    <div class="jr-list-item-content">
      <div class="jr-list-item-title">{{ title }}</div>
      <p v-if="description" class="jr-list-item-desc">{{ description }}</p>
      <slot />
    </div>
    <span v-if="trailing" class="jr-list-item-trailing">{{ trailing }}</span>
  </li>
</template>

<style scoped>
.jr-list-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: var(--jr-radius, 0.5rem);
  transition: background 0.15s ease;
}
.jr-list-item:hover {
  background: var(--jr-muted, #f4f4f5);
}
.jr-list-item + .jr-list-item {
  border-top: 1px solid var(--jr-border, #e4e4e7);
}
.jr-list-item:first-child {
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
}
.jr-list-item:last-child {
  border-bottom-left-radius: inherit;
  border-bottom-right-radius: inherit;
}
.jr-list-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  border-radius: var(--jr-radius, 0.5rem);
  background: var(--jr-muted, #f4f4f5);
  font-size: 1rem;
  color: var(--jr-muted-text, #71717a);
}
.jr-list-item-content {
  flex: 1;
  min-width: 0;
}
.jr-list-item-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--jr-fg, #09090b);
  line-height: 1.25;
}
.jr-list-item-desc {
  margin: 0.25rem 0 0;
  font-size: 0.8125rem;
  color: var(--jr-muted-text, #71717a);
  line-height: 1.5;
}
.jr-list-item-trailing {
  flex-shrink: 0;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--jr-muted-text, #71717a);
  font-variant-numeric: tabular-nums;
}
</style>
