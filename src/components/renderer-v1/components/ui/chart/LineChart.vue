<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import 'echarts'

interface Serie {
  name: string
  data: number[]
}

const props = withDefaults(
  defineProps<{
    title?: string | null
    categories: string[]
    series: Serie[]
  }>(),
  { title: null },
)

const option = computed(() => ({
  title: props.title ? { text: props.title, left: 'center' } : undefined,
  tooltip: { trigger: 'axis' as const },
  xAxis: { type: 'category' as const, data: props.categories },
  yAxis: { type: 'value' as const },
  series: props.series.map((s) => ({
    name: s.name,
    type: 'line' as const,
    data: s.data,
    smooth: true,
  })),
}))
</script>

<template>
  <div class="jr-chart">
    <VChart :option="option" autoresize style="height: 300px; width: 100%" />
  </div>
</template>
