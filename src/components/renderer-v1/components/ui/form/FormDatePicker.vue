<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string | null
    modelValue?: string | null
    placeholder?: string | null
  }>(),
  { modelValue: '' }
)
const emit = defineEmits<{ 'update:modelValue': [v: string] }>()
</script>

<template>
  <div class="jr-field">
    <label v-if="label" class="jr-field-label">{{ label }}</label>
    <input
      :value="modelValue ?? ''"
      type="date"
      :placeholder="placeholder ?? undefined"
      class="jr-input"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
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
.jr-input {
  display: flex;
  height: 2.5rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--jr-border, #e4e4e7);
  border-radius: var(--jr-radius, 0.5rem);
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--jr-fg, #09090b);
  background: transparent;
  transition: border-color 0.15s ease;
  box-sizing: border-box;
}
.jr-input:focus {
  outline: 1px solid var(--jr-ring, #18181b);
  outline-offset: 1px;
  border-color: transparent;
}
.jr-input:disabled {
  background: var(--jr-muted, #f4f4f5);
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
