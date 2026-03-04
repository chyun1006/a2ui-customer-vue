<script setup lang="ts">
interface Item {
  term: string
  detail: string | number
}

defineProps<{
  items: Item[]
  layout?: 'vertical' | 'horizontal' | null
}>()
</script>

<template>
  <dl
    :class="[
      'jr-dl',
      layout === 'horizontal' ? 'jr-dl--horizontal' : 'jr-dl--vertical',
    ]"
  >
    <template v-for="(item, i) in items" :key="i">
      <dt class="jr-dl-term">{{ item.term }}</dt>
      <dd class="jr-dl-detail">{{ item.detail }}</dd>
    </template>
  </dl>
</template>

<style scoped>
.jr-dl {
  margin: 0;
  padding: 0;
}
.jr-dl--vertical dt {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--jr-muted-text, #71717a);
  margin-top: 0.75rem;
}
.jr-dl--vertical dt:first-child {
  margin-top: 0;
}
.jr-dl--vertical dd {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: var(--jr-fg, #09090b);
}
.jr-dl--horizontal {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem 1.5rem;
  align-items: baseline;
}
.jr-dl--horizontal dt {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--jr-muted-text, #71717a);
}
.jr-dl--horizontal dd {
  margin: 0;
  font-size: 0.875rem;
  color: var(--jr-fg, #09090b);
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--jr-border, #e4e4e7);
}
.jr-dl--horizontal dd:last-of-type {
  border-bottom: none;
  padding-bottom: 0;
}
</style>
