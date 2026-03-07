<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    label: string
    value: number
    max?: number | null
  }>(),
  { max: 100 },
)

const pct = computed(() => Math.min(100, (props.value / (props.max ?? 100)) * 100))
</script>

<template>
  <div class="jr-progress">
    <span v-if="label" class="jr-progress-label">{{ label }}</span>
    <div class="jr-progress-track">
      <div class="jr-progress-fill" :style="{ width: `${pct}%` }" />
    </div>
  </div>
</template>
