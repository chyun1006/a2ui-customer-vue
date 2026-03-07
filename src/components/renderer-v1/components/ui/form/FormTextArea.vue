<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string | null
    placeholder?: string | null
    modelValue?: string | null
    rows?: number | null
  }>(),
  { modelValue: '', rows: 3 }
)
const emit = defineEmits<{ 'update:modelValue': [v: string] }>()
</script>

<template>
  <div class="jr-field">
    <label v-if="label" class="jr-field-label">{{ label }}</label>
    <textarea
      :value="modelValue ?? ''"
      :placeholder="placeholder ?? undefined"
      :rows="rows ?? 3"
      class="jr-textarea"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
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
.jr-textarea {
  display: flex;
  min-height: 5rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--jr-border, #e4e4e7);
  border-radius: var(--jr-radius, 0.5rem);
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--jr-fg, #09090b);
  background: transparent;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.15s ease;
  box-sizing: border-box;
}
.jr-textarea::placeholder {
  color: var(--jr-muted-text, #71717a);
}
.jr-textarea:focus {
  outline: 1px solid var(--jr-ring, #18181b);
  outline-offset: 1px;
  border-color: transparent;
}
.jr-textarea:disabled {
  background: var(--jr-muted, #f4f4f5);
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
