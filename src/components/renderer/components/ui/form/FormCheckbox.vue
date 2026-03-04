<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    modelValue?: boolean | null
  }>(),
  { modelValue: false }
)
const emit = defineEmits<{ 'update:modelValue': [v: boolean] }>()
</script>

<template>
  <label class="jr-checkbox-wrap">
    <button
      type="button"
      role="checkbox"
      :aria-checked="!!modelValue"
      :class="['jr-checkbox', { 'jr-checkbox--checked': modelValue }]"
      @click="emit('update:modelValue', !modelValue)"
    >
      <svg v-if="modelValue" class="jr-checkbox-check" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
    </button>
    <span class="jr-checkbox-label">{{ label }}</span>
  </label>
</template>

<style scoped>
.jr-checkbox-wrap {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}
.jr-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
  padding: 0;
  border: 1px solid var(--jr-primary, #18181b);
  border-radius: 0.25rem;
  background: transparent;
  color: transparent;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}
.jr-checkbox:focus-visible {
  outline: 1px solid var(--jr-ring, #18181b);
  outline-offset: 1px;
}
.jr-checkbox--checked {
  background: var(--jr-primary, #18181b);
  border-color: var(--jr-primary, #18181b);
  color: var(--jr-primary-fg, #fafafa);
}
.jr-checkbox-check {
  width: 0.75rem;
  height: 0.75rem;
}
.jr-checkbox-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--jr-fg, #09090b);
  line-height: 1.25;
}
</style>
