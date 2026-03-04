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
  <label class="jr-switch-wrap">
    <button
      type="button"
      role="switch"
      :aria-checked="!!modelValue"
      :class="['jr-switch', { 'jr-switch--on': modelValue }]"
      @click="emit('update:modelValue', !modelValue)"
    >
      <span class="jr-switch-thumb" />
    </button>
    <span class="jr-switch-label">{{ label }}</span>
  </label>
</template>

<style scoped>
.jr-switch-wrap {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}
.jr-switch-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--jr-fg, #09090b);
  line-height: 1.25;
}
.jr-switch {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  width: 2.75rem;
  height: 1.5rem;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 9999px;
  background: #e4e4e7;
  cursor: pointer;
  position: relative;
  transition: background 0.2s ease;
}
.jr-switch:focus-visible {
  outline: 1px solid var(--jr-ring, #18181b);
  outline-offset: 1px;
}
.jr-switch--on {
  background: var(--jr-primary, #18181b);
}
.jr-switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 1.125rem;
  height: 1.125rem;
  border-radius: 50%;
  background: white;
  transition: transform 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  pointer-events: none;
}
.jr-switch--on .jr-switch-thumb {
  transform: translateX(1.25rem);
}
</style>
