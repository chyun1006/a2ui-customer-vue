<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  unit?: string | null
  trend?: 'up' | 'down' | 'flat' | null
  trendValue?: string | null
}>()
</script>

<template>
  <div class="jr-metric">
    <span class="jr-metric-label">{{ label }}</span>
    <div class="jr-metric-row">
      <span class="jr-metric-value">{{ value }}</span>
      <span v-if="unit != null && unit !== ''" class="jr-metric-unit">{{ unit }}</span>
      <span
        v-if="trend != null"
        :class="['jr-metric-trend', `jr-metric-trend--${trend}`]"
      >
        {{ trendValue ?? '' }}
      </span>
    </div>
  </div>
</template>
