<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | null
    size?: 'sm' | 'md' | 'lg' | null
    disabled?: boolean | null
    loading?: boolean | null
  }>(),
  { variant: 'primary', size: 'md', disabled: false, loading: false },
)

const emit = defineEmits<{ press: [] }>()
</script>

<template>
  <button
    type="button"
    :class="[
      'jr-button',
      `jr-button--${variant ?? 'primary'}`,
      `jr-button--${size ?? 'md'}`,
      loading ? 'jr-button--loading' : '',
    ]"
    :disabled="!!disabled || !!loading"
    @click="emit('press')"
  >
    <span v-if="loading" class="jr-button-spinner" aria-hidden="true" />
    <span class="jr-button-label">{{ label }}</span>
  </button>
</template>
