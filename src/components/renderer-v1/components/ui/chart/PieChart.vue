<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import 'echarts'

interface PieItem {
  name: string
  value: number
}

const props = withDefaults(
  defineProps<{
    title?: string | null
    data: PieItem[]
  }>(),
  { title: null },
)

const option = computed(() => ({
  title: props.title ? { text: props.title, left: 'center' } : undefined,
  tooltip: { trigger: 'item' as const },
  legend: { orient: 'horizontal' as const, bottom: 0 },
  series: [
    {
      type: 'pie' as const,
      radius: '60%',
      data: props.data,
      label: { show: true },
    },
  ],
}))
</script>

<template>
  <div class="jr-chart">
    <VChart :option="option" autoresize style="height: 300px; width: 100%" />
  </div>
</template>
