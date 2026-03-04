<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    label?: string | null
    modelValue?: number | null
    min: number
    max: number
    step?: number | null
  }>(),
  { modelValue: 0, step: 1 }
)
const emit = defineEmits<{ 'update:modelValue': [v: number] }>()

const value = computed({
  get: () => props.modelValue ?? props.min,
  set: (v: number) => emit('update:modelValue', v),
})
</script>

<template>
  <div class="jr-field">
    <div v-if="label" class="jr-slider-header">
      <label class="jr-field-label">{{ label }}</label>
      <span class="jr-slider-value">{{ value }}</span>
    </div>
    <input
      v-model.number="value"
      type="range"
      :min="min"
      :max="max"
      :step="step ?? 1"
      class="jr-slider"
    />
  </div>
</template>

<style scoped>
.jr-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}
.jr-slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.jr-field-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--jr-fg, #09090b);
  line-height: 1.25;
}
.jr-slider-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--jr-muted-text, #71717a);
  font-variant-numeric: tabular-nums;
}
.jr-slider {
  width: 100%;
  height: 6px;
  margin: 0.5rem 0 0;
  -webkit-appearance: none;
  appearance: none;
  background: var(--jr-muted, #f4f4f5);
  border-radius: 9999px;
  outline: none;
}
.jr-slider:focus-visible {
  outline: 1px solid var(--jr-ring, #18181b);
  outline-offset: 2px;
}
.jr-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--jr-bg, #fff);
  border: 2px solid var(--jr-primary, #18181b);
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: transform 0.1s ease;
}
.jr-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}
.jr-slider::-webkit-slider-thumb:active {
  transform: scale(0.95);
}
.jr-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border: 2px solid var(--jr-primary, #18181b);
  border-radius: 50%;
  background: var(--jr-bg, #fff);
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
.jr-slider::-moz-range-track {
  height: 6px;
  background: var(--jr-muted, #f4f4f5);
  border-radius: 9999px;
}
</style>
