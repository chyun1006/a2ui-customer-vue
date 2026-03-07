<script setup lang="ts">
interface Option {
  label: string
  value: string
}

withDefaults(
  defineProps<{
    label?: string | null
    modelValue?: string | null
    placeholder?: string | null
    options: Option[]
  }>(),
  { modelValue: '' }
)
const emit = defineEmits<{ 'update:modelValue': [v: string] }>()
</script>

<template>
  <div class="jr-field">
    <label v-if="label" class="jr-field-label">{{ label }}</label>
    <div class="jr-select-wrapper">
      <select
        :value="modelValue ?? ''"
        class="jr-select"
        @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option
          v-for="opt in options"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>
      <svg class="jr-select-chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
    </div>
  </div>
</template>

<style scoped>
.jr-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}
.jr-field-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--jr-fg, #09090b);
  line-height: 1.25;
}
.jr-select-wrapper {
  position: relative;
  display: flex;
}
.jr-select {
  display: flex;
  height: 2.5rem;
  width: 100%;
  padding: 0.5rem 2.25rem 0.5rem 0.75rem;
  border: 1px solid var(--jr-border, #e4e4e7);
  border-radius: var(--jr-radius, 0.5rem);
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--jr-fg, #09090b);
  background: transparent;
  appearance: none;
  cursor: pointer;
  transition: border-color 0.15s ease;
  box-sizing: border-box;
}
.jr-select:focus {
  outline: 1px solid var(--jr-ring, #18181b);
  outline-offset: 1px;
  border-color: transparent;
}
.jr-select:disabled {
  background: var(--jr-muted, #f4f4f5);
  opacity: 0.5;
  cursor: not-allowed;
}
.jr-select-chevron {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--jr-muted-text, #71717a);
  pointer-events: none;
  width: 1rem;
  height: 1rem;
}
</style>
