<script setup lang="ts">
interface Option {
  label: string
  value: string
}

withDefaults(
  defineProps<{
    label?: string | null
    modelValue?: string | null
    options: Option[]
  }>(),
  { modelValue: '' }
)
const emit = defineEmits<{ 'update:modelValue': [v: string] }>()
</script>

<template>
  <div class="jr-radio-group" role="radiogroup" :aria-label="label ?? undefined">
    <div v-if="label" class="jr-radio-group-label">{{ label }}</div>
    <div class="jr-radio-options">
      <label
        v-for="opt in options"
        :key="opt.value"
        class="jr-radio-wrap"
      >
        <button
          type="button"
          role="radio"
          :aria-checked="(modelValue ?? '') === opt.value"
          :class="['jr-radio', { 'jr-radio--checked': (modelValue ?? '') === opt.value }]"
          @click="emit('update:modelValue', opt.value)"
        >
          <span class="jr-radio-indicator" />
        </button>
        <span class="jr-radio-label-text">{{ opt.label }}</span>
      </label>
    </div>
  </div>
</template>

<style scoped>
.jr-radio-group-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--jr-fg, #09090b);
  margin-bottom: 0.5rem;
  line-height: 1.25;
}
.jr-radio-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.jr-radio-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}
.jr-radio {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
  padding: 0;
  border: 1px solid var(--jr-primary, #18181b);
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  transition: border-color 0.15s ease;
}
.jr-radio:focus-visible {
  outline: 1px solid var(--jr-ring, #18181b);
  outline-offset: 1px;
}
.jr-radio-indicator {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: transparent;
  transition: background 0.15s ease;
}
.jr-radio--checked .jr-radio-indicator {
  background: var(--jr-primary, #18181b);
}
.jr-radio-label-text {
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--jr-fg, #09090b);
  line-height: 1.25;
}
</style>
